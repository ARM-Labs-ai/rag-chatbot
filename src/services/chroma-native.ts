import { ChromaClient, type Collection } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL;

export const chroma = new ChromaClient({ path: CHROMA_URL });

export const getOrCreateCollection = async (name: string): Promise<Collection> => {
  return chroma.getOrCreateCollection({ name });
};

export const getCollection = async (name: string): Promise<Collection> => {
  return chroma.getCollection({ name });
};

export const deleteCollection = async (name: string) => {
  return chroma.deleteCollection({ name });
};

export const listCollections = async () => {
  return chroma.listCollections();
};
