from fastembed import TextEmbedding
from typing import  List
import numpy as np

def embed(model: TextEmbedding, text: str) -> np.ndarray:
    return next(iter(model.embed([text])))

def embed_batch(model: TextEmbedding, texts: List[str]) -> List[np.ndarray]:
    return list(model.embed(texts))
