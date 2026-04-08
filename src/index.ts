import "dotenv/config";
import { config } from "@config/application";
import { app } from "@/app";

export const server = app.listen(config.PORT, () => {
  console.log(`✅  API:      http://localhost:${config.PORT}`);
  console.log(`📖  Swagger:  http://localhost:${config.PORT}/docs`);
  console.log(`🤖  Ollama:   ${process.env.OLLAMA_URL ?? "http://localhost:11434"}`);
  console.log(`🗄️  ChromaDB: ${process.env.CHROMA_URL ?? "http://localhost:8000"}`);
});
