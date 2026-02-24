import type { Collection } from "chromadb";
import { embedQuery } from "./ollama-embeddings";

export type RetrievedChunk = {
  id: string;
  text: string;
  metadata?: Record<string, any>;
  distance?: number;
};

export async function similaritySearch(
  collection: Collection,
  query: string,
  k = 5,
  where?: Record<string, any>
): Promise<RetrievedChunk[]> {
  const q = await embedQuery(query);

  const res = await collection.query({
    queryEmbeddings: [q],
    nResults: k,
    where,
    include: ["documents", "metadatas", "distances"],
  });

  const ids = res.ids?.[0] ?? [];
  const docs = res.documents?.[0] ?? [];
  const metas = res.metadatas?.[0] ?? [];
  const dists = res.distances?.[0] ?? [];

  return ids.map((id, i) => ({
    id,
    text: docs[i] ?? "",
    metadata: (metas[i] as any) ?? undefined,
    distance: dists[i] ?? undefined,
  }));
}
