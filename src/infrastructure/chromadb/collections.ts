import { ChromaClient, type Collection } from "chromadb";
import { config } from "@config/chromadb";

const chroma = new ChromaClient({
  host: config.URL,
  port: config.PORT,
});

export async function list(): Promise<Collection[]> {
  return chroma.listCollections();
}
