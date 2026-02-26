import "dotenv/config";
import express from "express";
import { config } from "@config/application";

export const app = express()
  .use(express.json())
  .listen(config.PORT, () => {
    console.log(`✅  API:      http://localhost:${config.PORT}`);
    console.log(`📖  Swagger:  http://localhost:${config.PORT}/docs`);
    console.log(`🤖  Ollama:   ${process.env.OLLAMA_URL ?? "http://localhost:11434"}`);
    console.log(`🗄️  ChromaDB: ${process.env.CHROMA_URL ?? "http://localhost:8000"}`);
  });
