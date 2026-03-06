import { ChromaClient, type Collection } from "chromadb";
import { OllamaEmbeddingFunction } from "@chroma-core/ollama";

const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
});

const embedder = new OllamaEmbeddingFunction({
  url: "http://localhost:11434",
  model: "nomic-embed-text",
});

export async function createCollection(name: string = "my_collection"): Promise<Collection> {
  return chroma.getOrCreateCollection({ name, embeddingFunction: embedder });
}

export async function clearDatabase(): Promise<void[]> {
  const collections = await chroma.listCollections();

  return Promise.all(collections.map((collection) => deleteCollection(collection.name)));
}

export async function deleteCollection(name: string = "my_collection"): Promise<void> {
  return chroma.deleteCollection({ name });
}
