import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RAG API",
      version: "1.0.0",
      description:
        "API REST para RAG com ChromaDB, LangChain e Ollama. Gerencie collections, documentos e sessões de chat com contexto persistente.",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local" },
    ],
    tags: [
      { name: "Collections", description: "Gerenciamento de collections de documentos" },
      { name: "Documents", description: "Adição, busca e remoção de documentos" },
      { name: "Chat", description: "Sessões de chat com contexto persistente no ChromaDB" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
