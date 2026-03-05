import { ChromaClient, type Collection } from "chromadb";

const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
});

export async function createCollection(name: string = "my_collection"): Promise<Collection> {
  return chroma.getOrCreateCollection({ name });
}

export async function clearDatabase(): Promise<void[]> {
  const collections = await chroma.listCollections();

  return Promise.all(collections.map((collection) => deleteCollection(collection.name)));
}

export async function deleteCollection(name: string = "my_collection"): Promise<void> {
  return chroma.deleteCollection({ name });
}
