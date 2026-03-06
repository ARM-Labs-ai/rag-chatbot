import getenv from "getenv";

export const config = {
  URL: getenv.string("OLLAMA_URL"),
  MODEL: getenv.string("OLLAMA_LLM_MODEL"),
  EMBEDDING_MODEL: getenv.string("OLLAMA_EMBEDDING_MODEL"),
};
