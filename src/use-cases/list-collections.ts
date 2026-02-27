import { list } from "@infra/chromadb/collections";
import type { Collection } from "chromadb";

export async function execute(): Promise<Collection[]> {
  return list();
}
