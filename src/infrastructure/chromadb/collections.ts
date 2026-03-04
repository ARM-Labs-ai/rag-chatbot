import { ChromaClient, type Collection } from "chromadb";
import { config } from "@config/chromadb";

const chroma = new ChromaClient({
  host: config.URL,
  port: config.PORT,
});

export async function list(): Promise<Collection[]> {
  return chroma.listCollections();
}

export async function create(collectionName: string): Promise<Collection> {
  return chroma.getOrCreateCollection({ name: collectionName });
}

export async function remove(collectionName: string): Promise<void> {
  chroma.deleteCollection({ name: collectionName });
}
