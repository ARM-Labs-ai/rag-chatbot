import { ChromaClient, type Collection } from "chromadb";

const chroma = new ChromaClient({
  host: "http://localhost",
  port: 8000,
});

export async function createCollection(name: string = "my_collection"): Promise<Collection> {
  return chroma.createCollection({ name });
}
