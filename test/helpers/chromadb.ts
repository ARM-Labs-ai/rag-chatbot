import { ChromaClient, type Collection } from "chromadb";

const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
});

export async function createCollection(name: string = "my_collection"): Promise<Collection> {
  return chroma.getOrCreateCollection({ name });
}

export async function clearDatabase(): Promise<any> {
  return chroma.reset();
}
