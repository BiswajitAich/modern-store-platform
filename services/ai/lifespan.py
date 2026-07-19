from contextlib import asynccontextmanager
from fastembed import TextEmbedding
from fastapi import FastAPI

from config import settings
# from providers.huggingface import HuggingFaceProvider


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Loading embedding model...")
    app.state.embedding_model = TextEmbedding(
        model_name=settings.EMBEDDING_MODEL
    )
    sample = next(iter(app.state.embedding_model.embed(["test"])))
    app.state.embedding_dimension = len(sample)
    print("Embedding model loaded.")

    yield

    print("Shutting down AI service...")
