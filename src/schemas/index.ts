import { z } from "zod";

// ── Collections ──────────────────────────────────────────────────────────────

export const CreateCollectionSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "name deve conter apenas letras, números, _ ou -",
    }),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const AddDocumentsSchema = z.object({
  documents: z
    .array(
      z.object({
        content: z.string().min(1),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .min(1),
  chunkSize: z.number().int().positive().default(1000),
  chunkOverlap: z.number().int().min(0).default(200),
});

export const DeleteDocumentsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

// ── Chat ─────────────────────────────────────────────────────────────────────

export const StartSessionSchema = z.object({
  collectionName: z.string().min(1),
  systemPrompt: z.string().optional(),
});

export const SendMessageSchema = z.object({
  message: z.string().min(1),
  k: z.number().int().positive().default(4),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type AddDocumentsInput = z.infer<typeof AddDocumentsSchema>;
export type DeleteDocumentsInput = z.infer<typeof DeleteDocumentsSchema>;
export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
