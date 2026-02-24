import { ChromaClient } from "chromadb";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";

const CHROMA_URL = process.env.CHROMA_URL;

export const chromaClient = new ChromaClient({ path: CHROMA_URL });

export const embeddings = new OllamaEmbeddings({
  model: process.env.OLLAMA_EMBED_MODEL,
  baseUrl: process.env.OLLAMA_URL,
});

export const getVectorStore = (collectionName: string): Promise<Chroma> =>
  Chroma.fromExistingCollection(embeddings, {
    collectionName,
    url: CHROMA_URL,
  });

export const addDocumentsToCollection = (
  docs: Document[],
  collectionName: string
): Promise<Chroma> =>
  Chroma.fromDocuments(docs, embeddings, {
    collectionName,
    url: CHROMA_URL,
  });
