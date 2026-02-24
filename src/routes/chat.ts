import { Router, Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate.js";
import { StartSessionSchema, SendMessageSchema } from "../schemas/index.js";
import {
  startSession,
  sendMessage,
  getSessionHistory,
  getSessionCollectionName,
  deleteSession,
} from "../services/chat.js";

const router = Router();

const DEFAULT_SYSTEM_PROMPT = `Você é um assistente prestativo e preciso.
Use apenas o contexto fornecido para responder às perguntas.
Se não encontrar a resposta no contexto, diga honestamente que não sabe — nunca invente informações.
Responda sempre no mesmo idioma da pergunta do usuário.`;

// systemPrompt fica em memória pois é metadado da sessão, não do histórico semântico
const sessionPrompts = new Map<string, string>();

// ── Sessions ──────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /chat/sessions:
 *   post:
 *     summary: Inicia uma nova sessão de chat
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [collectionName]
 *             properties:
 *               collectionName:
 *                 type: string
 *                 example: minha-base
 *               systemPrompt:
 *                 type: string
 *                 description: Prompt de sistema customizado (opcional)
 *     responses:
 *       201:
 *         description: Sessão criada com sucesso
 *       404:
 *         description: Collection não encontrada
 */
router.post(
  "/sessions",
  validate(StartSessionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { collectionName, systemPrompt } = req.body;
      const session = await startSession(collectionName);
      sessionPrompts.set(session.sessionId, systemPrompt ?? DEFAULT_SYSTEM_PROMPT);
      res.status(201).json(session);
    } catch (err: any) {
      if (err.message?.includes("does not exist")) {
        res.status(404).json({ error: `Collection "${req.body.collectionName}" não encontrada` });
        return;
      }
      next(err);
    }
  }
);

/**
 * @openapi
 * /chat/sessions/{sessionId}/messages:
 *   post:
 *     summary: Envia uma mensagem e recebe a resposta do assistente
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: O que é RAG?
 *               k:
 *                 type: integer
 *                 default: 4
 *                 description: Número de chunks relevantes a recuperar
 *     responses:
 *       200:
 *         description: Resposta do assistente
 *       404:
 *         description: Sessão não encontrada
 */
router.post(
  "/sessions/:sessionId/messages",
  validate(SendMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const { message, k } = req.body;
      console.log("===> sessionId", sessionId);
      console.log("===> message", message);
      console.log("===> k", k);

      // Busca o collectionName da sessão no histórico persistido
      const collectionName = await getSessionCollectionName(sessionId);

      if (!collectionName) {
        res.status(404).json({ error: "Sessão não encontrada" });
        return;
      }

      const systemPrompt = sessionPrompts.get(sessionId) ?? DEFAULT_SYSTEM_PROMPT;

      const { answer, sources } = await sendMessage(
        sessionId,
        collectionName,
        message,
        systemPrompt,
        k
      );

      res.json({ answer, sources });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /chat/sessions/{sessionId}/messages:
 *   get:
 *     summary: Retorna o histórico completo de uma sessão
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Histórico de mensagens
 */
router.get(
  "/sessions/:sessionId/messages",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await getSessionHistory(req.params.sessionId);
      res.json({ sessionId: req.params.sessionId, messages });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /chat/sessions/{sessionId}:
 *   delete:
 *     summary: Deleta uma sessão e todo o seu histórico
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sessão deletada
 */
router.delete(
  "/sessions/:sessionId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteSession(req.params.sessionId);
      sessionPrompts.delete(req.params.sessionId);
      res.json({ message: "Sessão deletada com sucesso" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
