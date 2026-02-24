import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import collectionsRouter from "./routes/collections.js";
import chatRouter from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

// ── Docs ──────────────────────────────────────────────────────────────────────
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/collections", collectionsRouter);
app.use("/chat", chatRouter);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`✅  API:      http://localhost:${PORT}`);
  console.log(`📖  Swagger:  http://localhost:${PORT}/docs`);
  console.log(`🤖  Ollama:   ${process.env.OLLAMA_URL ?? "http://localhost:11434"}`);
  console.log(`🗄️   ChromaDB: ${process.env.CHROMA_URL ?? "http://localhost:8000"}`);
});
