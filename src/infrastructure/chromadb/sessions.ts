import { type Collection } from "chromadb";
import { v4 as uuidv4 } from "uuid";

export async function create(collection: Collection, systemPrompt: string): Promise<Collection> {
  const sessionId = uuidv4();

  await collection.add({
    ids: [uuidv4()],
    documents: [systemPrompt],
    metadatas: [{
      sessionId,
      role: "human",
      timestamp: new Date().toISOString(),
    }]
  });

  return collection;
}
