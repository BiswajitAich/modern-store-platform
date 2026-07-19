from config import settings
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from typing import List
import numpy as np
from services.embedding_service import embed, embed_batch

router = APIRouter()

class EmbeddingRequest(BaseModel):
    text: str

class BatchEmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1)

@router.post("/embeddings")
async def create_embedding(request: Request, body: EmbeddingRequest):
    print(f"DEBUG: Received request: {body}")
    model = request.app.state.embedding_model
    embedding = embed(model, body.text)
    return {
        "model": settings.EMBEDDING_MODEL,
        "dimensions": len(embedding),
        "embedding": embedding.tolist(),
    }

@router.post("/embeddings/batch")
async def create_embedding_batch(request: Request, body: BatchEmbeddingRequest):
    model = request.app.state.embedding_model
    embeddings = embed_batch(model, body.texts)

    return {
        "model": settings.EMBEDDING_MODEL,
        "count": len(embeddings),
        "dimensions": len(embeddings[0]) if len(embeddings) > 0 else 0,
        "embeddings": [e.tolist() if isinstance(e, np.ndarray) else list(e) for e in embeddings],
    }
