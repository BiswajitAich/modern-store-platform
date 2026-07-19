# from sentence_transformers import SentenceTransformer

# from .base import EmbeddingProvider


# class HuggingFaceProvider(EmbeddingProvider):

#     def __init__(self, model_name: str):
#         self.model = SentenceTransformer(model_name)

#     def embed(self, text: str) -> list[float]:
#         return self.model.encode(text, normalize_embeddings=True).tolist()
