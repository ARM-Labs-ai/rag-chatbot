import { OllamaEmbeddingFunction } from "@chroma-core/ollama";
import { config } from "@config/ollama";

export const embedder = new OllamaEmbeddingFunction({
  url: config.URL,
  model: config.EMBEDDING_MODEL,
});
