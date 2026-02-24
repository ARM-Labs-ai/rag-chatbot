const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_LLM_MODEL;

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(
    texts.map(async (text) => {
      const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt: text }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ollama embeddings failed: ${res.status} ${msg}`);
      }

      const json = await res.json();

      return json.embedding as number[];
    })
  );

  return results;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await embedDocuments([text]);

  return v;
}
