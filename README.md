# 🌐 U-Dig Brain API + Website OS V2

This repository combines two major components:

---

## 🐍 U-Dig Brain API
A Python-based API with diagnostics, filters, and MMR features.

### Tech Stack
- **FastAPI** – Web framework
- **Uvicorn** – ASGI server
- **NumPy** – Numerical operations
- **python-dotenv** – Environment management
- **Qdrant-client** – Vector database
- **OpenAI SDK** – LLM integration

### Run Locally
```bash
pip install -r requirements.txt
uvicorn api:app --reload
