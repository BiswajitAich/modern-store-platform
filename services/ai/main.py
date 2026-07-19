from config import settings
from fastapi import FastAPI, Request

from api.embeddings import router
from lifespan import lifespan


app = FastAPI(
    title="Commyfy AI Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router, prefix="/v1")

@app.get("/")
def health(request: Request):
    return {
        "status": "ok",
        "model": settings.EMBEDDING_MODEL,
        "dimensions": request.app.state.embedding_dimension,
    }
