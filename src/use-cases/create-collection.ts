import { create } from "@infra/chromadb/collections";
import type { Collection } from "chromadb";

export async function execute(collectionName: string): Promise<Collection> {
  return create(collectionName);
}
