import { remove } from "@infra/chromadb/collections";

export async function execute(collectionName: string): Promise<void> {
  remove(collectionName);
}
