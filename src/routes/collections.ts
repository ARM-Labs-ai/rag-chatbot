import { Router, Request, Response, NextFunction } from "express";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { validate } from "../middleware/validate.js";
import {
  CreateCollectionSchema,
  AddDocumentsSchema,
  DeleteDocumentsSchema,
} from "../schemas/index.js";
import {
  chromaClient,
  getVectorStore,
  addDocumentsToCollection,
  embeddings,
} from "../services/chroma.js";

const router = Router();

// ── Collections ───────────────────────────────────────────────────────────────

/**
 * @openapi
 * /collections:
 *   get:
 *     summary: Lista todas as collections
 *     tags: [Collections]
 *     responses:
 *       200:
 *         description: Lista de collections
 */
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await chromaClient.listCollections();
    res.json(collections);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /collections:
 *   post:
 *     summary: Cria uma nova collection
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: minha-base
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Collection criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Collection já existe
 */
router.post(
  "/",
  validate(CreateCollectionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, metadata } = req.body;
      const collection = await chromaClient.createCollection({
        name, metadata, embeddingFunction: {
          generate: async (texts: string[]) => {
            return embeddings.embedDocuments(texts);
          }
        }
      });
      res.status(201).json(collection);
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        res.status(409).json({ error: `Collection "${req.body.name}" já existe` });
        return;
      }
      next(err);
    }
  }
);

/**
 * @openapi
 * /collections/{name}:
 *   get:
 *     summary: Retorna detalhes de uma collection
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes da collection
 *       404:
 *         description: Collection não encontrada
 */
router.get("/:name", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await chromaClient.getCollection({
      name: req.params.name, embeddingFunction: {
        generate: async (texts: string[]) => {
          return embeddings.embedDocuments(texts);
        }
      }
    });
    const count = await collection.count();
    res.json({ name: req.params.name, count, metadata: collection.metadata });
  } catch {
    res.status(404).json({ error: `Collection "${req.params.name}" não encontrada` });
  }
});

/**
 * @openapi
 * /collections/{name}:
 *   delete:
 *     summary: Deleta uma collection e todos os seus documentos
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection deletada
 *       404:
 *         description: Collection não encontrada
 */
router.delete("/:name", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await chromaClient.deleteCollection({ name: req.params.name });
    res.json({ message: `Collection "${req.params.name}" deletada com sucesso` });
  } catch {
    res.status(404).json({ error: `Collection "${req.params.name}" não encontrada` });
  }
});

// ── Documents ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /collections/{name}/documents:
 *   post:
 *     summary: Adiciona documentos à collection com chunking automático
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [documents]
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [content]
 *                   properties:
 *                     content:
 *                       type: string
 *                     metadata:
 *                       type: object
 *               chunkSize:
 *                 type: integer
 *                 default: 1000
 *               chunkOverlap:
 *                 type: integer
 *                 default: 200
 *     responses:
 *       201:
 *         description: Documentos adicionados
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/:name/documents",
  validate(AddDocumentsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documents, chunkSize, chunkOverlap } = req.body;

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
      });

      const docs: Document[] = await splitter.createDocuments(
        documents.map((d: { content: string }) => d.content),
        documents.map((d: { metadata?: Record<string, unknown> }) => d.metadata ?? {})
      );

      await addDocumentsToCollection(docs, req.params.name);

      res.status(201).json({
        message: `${docs.length} chunk(s) adicionado(s) com sucesso`,
        chunks: docs.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /collections/{name}/documents/search:
 *   get:
 *     summary: Busca documentos por similaridade semântica
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Texto da busca
 *       - in: query
 *         name: k
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Número de resultados
 *     responses:
 *       200:
 *         description: Resultados encontrados
 *       400:
 *         description: Parâmetro q ausente
 */
router.get(
  "/:name/documents/search",
  async (req: Request, res: Response, next: NextFunction) => {
    const { q, k = "5" } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({ error: "Parâmetro ?q= é obrigatório" });
      return;
    }

    try {
      const vectorStore = await getVectorStore(req.params.name);
      const results = await vectorStore.similaritySearchWithScore(q, Number(k));
      res.json(
        results.map(([doc, score]) => ({
          content: doc.pageContent,
          metadata: doc.metadata,
          score,
        }))
      );
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /collections/{name}/documents:
 *   delete:
 *     summary: Deleta documentos pelo ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Documentos deletados
 *       400:
 *         description: Dados inválidos
 */
router.delete(
  "/:name/documents",
  validate(DeleteDocumentsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body;
      const vectorStore = await getVectorStore(req.params.name);
      await vectorStore.delete({ ids });
      res.json({ message: `${ids.length} documento(s) deletado(s)` });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
