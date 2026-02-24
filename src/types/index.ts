export interface ChatMessage {
  role: "human" | "ai";
  content: string;
  timestamp: string;
}

export interface CollectionInfo {
  name: string;
  count: number;
  metadata: Record<string, unknown>;
}
