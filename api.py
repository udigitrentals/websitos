# api.py — robust version with diagnostics, filters & MMR
import os, logging
from typing import List, Optional

import numpy as np
from dotenv import load_dotenv; load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.http import models as qm
from openai import OpenAI

APP_KEY = os.getenv("APP_API_KEY", "dev-local-secret")
COL     = os.getenv("QDRANT_COLLECTION", "u_dig_brain_v1")
MODEL   = os.getenv("EMBED_MODEL", "text-embedding-3-small")

app = FastAPI(title="U-Dig Brain Search", version="1.1.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=False,
    allow_methods=["*"], allow_headers=["*"],
)

# Initialize clients once
try:
    qc  = QdrantClient(url=os.environ["QDRANT_URL"], api_key=os.environ["QDRANT_API_KEY"])
except KeyError as e:
    raise RuntimeError(f"Missing Qdrant env var: {e}")

try:
    oai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
except KeyError as e:
    raise RuntimeError(f"Missing OpenAI env var: {e}")

def auth(authorization: str | None = Header(None)):
    if authorization != f"Bearer {APP_KEY}":
        raise HTTPException(401, "Unauthorized")

class Query(BaseModel):
    q: str = Field(..., min_length=1)
    k: int = 12
    mmr_k: int = 6
    threshold: float = 0.2
    tags_any: Optional[List[str]] = None
    type_any: Optional[List[str]] = None
    path_contains: Optional[str] = None  # substring filter on section_path (local fallback)

def mmr(q: np.ndarray, docs: List[np.ndarray], k: int = 6, lam: float = 0.5) -> List[int]:
    if not docs: return []
    sim = lambda a,b: float(np.dot(a,b) / (np.linalg.norm(a)*np.linalg.norm(b) + 1e-8))
    q_sims = [sim(q, d) for d in docs]
    sel = [int(np.argmax(q_sims))]
    cand = [i for i in range(len(docs)) if i != sel[0]]
    while len(sel) < min(k, len(docs)) and cand:
        best = (-1e9, None)
        for c in cand:
            rel = q_sims[c]
            div = max(sim(docs[c], docs[s]) for s in sel)
            score = lam*rel - (1-lam)*div
            if score > best[0]:
                best = (score, c)
        sel.append(best[1]); cand.remove(best[1])
    return sel

def build_filter(body: Query):
    must = []
    if body.tags_any:
        must.append(qm.FieldCondition(key="tags", match=qm.MatchAny(any=body.tags_any)))
    if body.type_any:
        must.append(qm.FieldCondition(key="type", match=qm.MatchAny(any=body.type_any)))
    # If server supports text match, use it; otherwise we will local-filter below
    if body.path_contains and hasattr(qm, "MatchText"):
        must.append(qm.FieldCondition(key="section_path", match=qm.MatchText(text=body.path_contains)))
    return qm.Filter(must=must) if must else None

@app.get("/health")
def health():
    return {"ok": True, "collection": COL}

@app.get("/debug/diag")
def diag(_=Depends(auth)):
    # OpenAI probe
    key_ok = (os.getenv("OPENAI_API_KEY") or "").strip().startswith("sk-")
    embed_ok_dim, embed_err = None, None
    try:
        if key_ok:
            e = oai.embeddings.create(model=MODEL, input=["hello"])
            embed_ok_dim = len(e.data[0].embedding)
    except Exception as ex:
        embed_err = str(ex)[:400]

    # Qdrant probe
    q_ok, count = True, None
    try:
        res = qc.count(collection_name=COL, count_filter=None, exact=True)
        count = getattr(res, "count", None)
    except Exception:
        q_ok = False

    return {
        "openai_key_loaded": bool(key_ok),
        "embed_ok_dim": embed_ok_dim,
        "embed_error": embed_err,
        "qdrant_ok": q_ok,
        "qdrant_points": count
    }

@app.post("/search")
def search(body: Query, _=Depends(auth)):
    # 1) Embed the query
    try:
        qv = oai.embeddings.create(model=MODEL, input=[body.q]).data[0].embedding
    except Exception as ex:
        raise HTTPException(status_code=502, detail=f"embedding_error: {str(ex)[:400]}")
    qv_np = np.array(qv, dtype=np.float64)

    # 2) Server-side filter
    qfilter = build_filter(body)

    # 3) Qdrant vector search (ask vectors for MMR)
    try:
        res = qc.search(
            collection_name=COL,
            query_vector=qv,
            limit=body.k,
            with_payload=True,
            with_vectors=True,          # Python client flag (plural)
            score_threshold=body.threshold,
            query_filter=qfilter
        ) or []
    except Exception as ex:
        raise HTTPException(status_code=502, detail=f"qdrant_search_error: {str(ex)[:400]}")

    # 3b) Local substring path filter if server-side MatchText not available
    if body.path_contains and not hasattr(qm, "MatchText"):
        needle = body.path_contains.lower()
        res = [h for h in res if needle in ((h.payload or {}).get("section_path", "").lower())]

    if not res:
        return {"hits": []}

    # 4) Optional MMR
    if body.mmr_k and body.mmr_k < len(res):
        vecs = [np.array(h.vector, dtype=np.float64) for h in res if h.vector is not None]
        if len(vecs) == len(res):
            keep = mmr(qv_np, vecs, k=body.mmr_k, lam=0.5)
            res = [res[i] for i in keep]

    # 5) Shape response (citation-ready)
    hits = []
    for h in res:
        p = h.payload or {}
        hits.append({
            "doc_id": p.get("doc_id"),
            "title": p.get("title"),
            "section_path": p.get("section_path"),
            "text": p.get("text"),
            "score": h.score
        })
    return {"hits": hits}

# TEMP: return error details to the client during setup; switch to minimal once stable
@app.exception_handler(Exception)
async def _unhandled(request, exc):
    logging.exception("Unhandled exception")
    return JSONResponse(status_code=500, content={"error": "internal_error", "detail": str(exc)[:500]})
