import { ChromaClient, type Collection } from "chromadb";
import { config } from "@config/chromadb";
import { embedder } from "@infra/ollama/embeddings";

const chroma = new ChromaClient({
  host: config.URL,
  port: config.PORT,
});

export async function list(): Promise<Collection[]> {
  return chroma.listCollections();
}

export async function create(collectionName: string): Promise<Collection> {
  return chroma.createCollection({
    name: collectionName,
    embeddingFunction: embedder,
  });
}

export async function remove(collectionName: string): Promise<void> {
  return chroma.deleteCollection({ name: collectionName });
}

export async function retrieve(collectionName: string): Promise<Collection> {
  return chroma.getCollection({
    name: collectionName,
    embeddingFunction: embedder,
  });
}
