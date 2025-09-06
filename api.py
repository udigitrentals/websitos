# api.py — robust version with env handling, diagnostics, ingest, search, and Qdrant lifecycle management
import os, logging
from typing import List, Optional
from uuid import uuid4

import numpy as np
from dotenv import load_dotenv

# Force loading from project root
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from qdrant_client import QdrantClient
from qdrant_client.http import models as qm
from openai import OpenAI
import fitz  # PyMuPDF for PDFs

# -------------------------------------------------------------------
# Config from env
# -------------------------------------------------------------------
APP_KEY = os.getenv("APP_API_KEY", "dev-local-secret")
COL     = os.getenv("QDRANT_COLLECTION", "u_dig_brain_v1")
MODEL   = os.getenv("EMBED_MODEL", "text-embedding-3-small")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# -------------------------------------------------------------------
# FastAPI setup
# -------------------------------------------------------------------
app = FastAPI(title="U-Dig Brain Search", version="1.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=False,
    allow_methods=["*"], allow_headers=["*"],
)

# -------------------------------------------------------------------
# Clients
# -------------------------------------------------------------------
qc, oai = None, None
if QDRANT_URL and QDRANT_API_KEY:
    try:
        qc = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        print("✅ Qdrant client initialized")
    except Exception as e:
        print(f"⚠️ Failed to init Qdrant client: {e}")

if OPENAI_API_KEY:
    try:
        oai = OpenAI(api_key=OPENAI_API_KEY)
        print("✅ OpenAI client initialized")
    except Exception as e:
        print(f"⚠️ Failed to init OpenAI client: {e}")

# -------------------------------------------------------------------
# Ensure collection
# -------------------------------------------------------------------
def ensure_collection():
    if not qc:
        return
    try:
        collections = qc.get_collections().collections
        if not any(c.name == COL for c in collections):
            print(f"⚠️ Collection '{COL}' not found. Creating...")
            qc.create_collection(
                collection_name=COL,
                vectors_config=qm.VectorParams(size=1536, distance="Cosine")
            )
            print(f"✅ Collection '{COL}' created.")
    except Exception as e:
        print(f"⚠️ Failed to ensure collection: {e}")

ensure_collection()

# -------------------------------------------------------------------
# Auth
# -------------------------------------------------------------------
bearer_scheme = HTTPBearer()
def auth(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if credentials.credentials != APP_KEY:
        raise HTTPException(401, "Unauthorized")

# -------------------------------------------------------------------
# Models
# -------------------------------------------------------------------
class Query(BaseModel):
    q: str = Field(..., min_length=1)
    k: int = 12
    mmr_k: int = 6
    threshold: float = 0.2
    tags_any: Optional[List[str]] = None
    type_any: Optional[List[str]] = None
    path_contains: Optional[str] = None

class IngestRequest(BaseModel):
    texts: List[str]

# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------
def mmr(q: np.ndarray, docs: List[np.ndarray], k: int = 6, lam: float = 0.5):
    if not docs: return []
    sim = lambda a, b: float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))
    q_sims = [sim(q, d) for d in docs]
    sel = [int(np.argmax(q_sims))]
    cand = [i for i in range(len(docs)) if i != sel[0]]
    while len(sel) < min(k, len(docs)) and cand:
        best = (-1e9, None)
        for c in cand:
            rel = q_sims[c]
            div = max(sim(docs[c], docs[s]) for s in sel)
            score = lam * rel - (1 - lam) * div
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
    if body.path_contains and hasattr(qm, "MatchText"):
        must.append(qm.FieldCondition(key="section_path", match=qm.MatchText(text=body.path_contains)))
    return qm.Filter(must=must) if must else None

# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------
@app.get("/health")
def health():
    return {"ok": True, "collection": COL, "qdrant_ready": bool(qc), "openai_ready": bool(oai)}

@app.get("/version")
def version():
    return {"version": app.version, "title": app.title}

@app.get("/debug/diag")
def diag(_=Depends(auth)):
    embed_ok_dim, embed_err = None, None
    key_ok = bool(OPENAI_API_KEY and OPENAI_API_KEY.startswith("sk-"))
    try:
        if key_ok and oai:
            e = oai.embeddings.create(model=MODEL, input=["hello"])
            embed_ok_dim = len(e.data[0].embedding)
    except Exception as ex:
        embed_err = str(ex)[:400]

    q_ok, count = False, None
    if qc:
        try:
            res = qc.count(collection_name=COL, count_filter=None, exact=True)
            count = getattr(res, "count", None)
            q_ok = True
        except Exception as ex:
            q_ok = False
            embed_err = f"Qdrant error: {ex}"

    return {
        "openai_key_loaded": key_ok,
        "embed_ok_dim": embed_ok_dim,
        "embed_error": embed_err,
        "qdrant_ok": q_ok,
        "qdrant_points": count
    }

@app.get("/collections")
def list_collections(_=Depends(auth)):
    if not qc: raise HTTPException(500, "Qdrant not initialized")
    try:
        cols = qc.get_collections().collections
        return {"collections": [
            {
                "name": c.name,
                "status": getattr(c, "status", None),
                "vectors_count": getattr(c, "vectors_count", None),
                "config": c.config.dict() if getattr(c, "config", None) else None
            } for c in cols
        ]}
    except Exception as ex:
        raise HTTPException(500, f"list_collections_error: {str(ex)[:400]}")

@app.delete("/delete_collection/{name}")
def delete_collection(name: str, _=Depends(auth)):
    if not qc: raise HTTPException(500, "Qdrant not initialized")
    try:
        qc.delete_collection(name)
        return {"status": "ok", "deleted": name}
    except Exception as ex:
        raise HTTPException(500, f"delete_collection_error: {str(ex)[:400]}")

@app.post("/reset_collection")
def reset_collection(_=Depends(auth)):
    if not qc: raise HTTPException(500, "Qdrant not initialized")
    try:
        qc.delete_collection(COL)
        qc.create_collection(
            collection_name=COL,
            vectors_config=qm.VectorParams(size=1536, distance="Cosine")
        )
        return {"status": "ok", "reset": COL}
    except Exception as ex:
        raise HTTPException(500, f"reset_collection_error: {str(ex)[:400]}")

@app.post("/ingest")
def ingest(data: IngestRequest, _=Depends(auth)):
    ensure_collection()
    if not oai: raise HTTPException(500, "OpenAI not initialized")
    if not qc: raise HTTPException(500, "Qdrant not initialized")

    try:
        response = oai.embeddings.create(model=MODEL, input=data.texts)
        qc.upsert(
            collection_name=COL,
            points=[
                qm.PointStruct(
                    id=str(uuid4()),
                    vector=item.embedding,
                    payload={"doc_id": str(uuid4()), "text": data.texts[i], "title": f"Doc {i+1}"}
                )
                for i, item in enumerate(response.data)
            ]
        )
    except Exception as ex:
        raise HTTPException(500, f"ingest_error: {str(ex)[:400]}")
    return {"status": "ok", "ingested": len(data.texts)}

@app.post("/ingest_file")
async def ingest_file(file: UploadFile = File(...), _=Depends(auth)):
    ensure_collection()
    if not oai: raise HTTPException(500, "OpenAI not initialized")
    if not qc: raise HTTPException(500, "Qdrant not initialized")

    text_content = ""
    try:
        if file.filename.endswith(".txt"):
            text_content = (await file.read()).decode("utf-8")
        elif file.filename.endswith(".pdf"):
            pdf_bytes = await file.read()
            pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text_content = "\n".join(page.get_text() for page in pdf_doc)
        else:
            raise HTTPException(400, "Only .txt and .pdf files supported")
    except Exception as ex:
        raise HTTPException(500, f"file_read_error: {str(ex)[:400]}")

    if not text_content.strip():
        raise HTTPException(400, "No readable text in file")

    words = text_content.split()
    chunk_size = 200
    chunks = [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

    try:
        response = oai.embeddings.create(model=MODEL, input=chunks)
        qc.upsert(
            collection_name=COL,
            points=[
                qm.PointStruct(
                    id=str(uuid4()),
                    vector=item.embedding,
                    payload={"doc_id": str(uuid4()), "title": file.filename, "section_path": f"chunk_{i}", "text": chunks[i]}
                )
                for i, item in enumerate(response.data)
            ]
        )
    except Exception as ex:
        raise HTTPException(500, f"ingest_file_error: {str(ex)[:400]}")
    return {"status": "ok", "file": file.filename, "chunks_ingested": len(chunks)}

@app.post("/search")
def search(body: Query, _=Depends(auth)):
    if not oai: raise HTTPException(500, "OpenAI not initialized")
    if not qc: raise HTTPException(500, "Qdrant not initialized")

    try:
        qv = oai.embeddings.create(model=MODEL, input=[body.q]).data[0].embedding
    except Exception as ex:
        raise HTTPException(502, f"embedding_error: {str(ex)[:400]}")
    qv_np = np.array(qv, dtype=np.float64)

    qfilter = build_filter(body)
    try:
        res = qc.search(
            collection_name=COL,
            query_vector=qv,
            limit=body.k,
            with_payload=True,
            with_vectors=True,
            score_threshold=body.threshold,
            query_filter=qfilter
        ) or []
    except Exception as ex:
        raise HTTPException(502, f"qdrant_search_error: {str(ex)[:400]}")

    if body.path_contains and not hasattr(qm, "MatchText"):
        res = [h for h in res if body.path_contains.lower() in ((h.payload or {}).get("section_path", "").lower())]

    if not res: return {"hits": []}

    if body.mmr_k and body.mmr_k < len(res):
        vecs = [np.array(h.vector, dtype=np.float64) for h in res if h.vector]
        if len(vecs) == len(res):
            keep = mmr(qv_np, vecs, k=body.mmr_k)
            res = [res[i] for i in keep]

    return {"hits": [
        {"doc_id": h.payload.get("doc_id"), "title": h.payload.get("title"),
         "section_path": h.payload.get("section_path"), "text": h.payload.get("text"), "score": h.score}
        for h in res
    ]}

# -------------------------------------------------------------------
# Global error handler
# -------------------------------------------------------------------
@app.exception_handler(Exception)
async def _unhandled(request, exc):
    logging.exception("Unhandled exception")
    return JSONResponse(status_code=500, content={"error": "internal_error", "detail": str(exc)[:500]})
