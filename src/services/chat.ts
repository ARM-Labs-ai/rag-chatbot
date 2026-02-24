import { ChatOllama } from "@langchain/ollama";
import { Collection } from "chromadb";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "../types/index.js";
import { chromaClient, getVectorStore } from "./chroma.js";

const CHAT_COLLECTION = process.env.CHROMA_CHAT_COLLECTION ?? "chat_history";

const llm = new ChatOllama({
  model: process.env.OLLAMA_LLM_MODEL ?? "llama3.2",
  baseUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getChatCollection(): Promise<Collection> {
  return chromaClient.getOrCreateCollection({ name: CHAT_COLLECTION });
}

async function persistMessage(
  sessionId: string,
  collectionName: string,
  role: "human" | "ai",
  content: string
): Promise<void> {
  const col = await getChatCollection();
  await col.add({
    ids: [uuidv4()],
    documents: [content],
    metadatas: [
      {
        sessionId,
        collectionName,
        role,
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function startSession(
  collectionName: string
): Promise<{ sessionId: string; collectionName: string }> {
  // Verifica se a collection de documentos existe antes de criar a sessão
  await chromaClient.getCollection({ name: collectionName });
  return { sessionId: uuidv4(), collectionName };
}

export async function sendMessage(
  sessionId: string,
  collectionName: string,
  userMessage: string,
  systemPrompt: string,
  k: number
): Promise<{ answer: string; sources: string[] }> {
  // 1. Buscar chunks relevantes da collection de documentos
  const vectorStore = await getVectorStore(collectionName);
  const relevantDocs = await vectorStore.similaritySearch(userMessage, k);
  const context = relevantDocs.map((d) => d.pageContent).join("\n\n---\n\n");

  // 2. Recuperar histórico da sessão do ChromaDB
  const col = await getChatCollection();
  const historyResult = await col.get({
    where: { sessionId },
    include: ["documents", "metadatas"] as any,
  });

  const history: ChatMessage[] = historyResult.ids
    .map((_, i) => ({
      role: historyResult.metadatas![i].role as "human" | "ai",
      content: historyResult.documents![i] as string,
      timestamp: historyResult.metadatas![i].timestamp as string,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const historyText = history
    .map((m) => `${m.role === "human" ? "Usuário" : "Assistente"}: ${m.content}`)
    .join("\n");

  // 3. Montar o prompt completo
  const prompt = [
    systemPrompt,
    context ? `\nContexto relevante:\n${context}` : "",
    historyText ? `\nHistórico da conversa:\n${historyText}` : "",
    `\nUsuário: ${userMessage}`,
    "Assistente:",
  ]
    .filter(Boolean)
    .join("\n");

  // 4. Invocar o LLM
  const response = await llm.invoke(prompt);
  const answer =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  // 5. Persistir as mensagens no ChromaDB
  await persistMessage(sessionId, collectionName, "human", userMessage);
  await persistMessage(sessionId, collectionName, "ai", answer);

  const sources = relevantDocs
    .map((d) => d.metadata?.source as string)
    .filter(Boolean);

  return { answer, sources };
}

export async function getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
  const col = await getChatCollection();
  const result = await col.get({
    where: { sessionId },
    include: ["documents", "metadatas"] as any,
  });

  if (!result.ids.length) return [];

  return result.ids
    .map((_, i) => ({
      role: result.metadatas![i].role as "human" | "ai",
      content: result.documents![i] as string,
      timestamp: result.metadatas![i].timestamp as string,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function getSessionCollectionName(
  sessionId: string
): Promise<string | null> {
  const col = await getChatCollection();
  const result = await col.get({
    where: { sessionId },
    limit: 1,
    include: ["metadatas"] as any,
  });
  return (result.metadatas?.[0]?.collectionName as string) ?? null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const col = await getChatCollection();
  const result = await col.get({ where: { sessionId } });
  if (result.ids.length) {
    await col.delete({ ids: result.ids });
  }
}
