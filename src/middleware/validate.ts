import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // zod v4: error.flatten() still works, but .fieldErrors is now .fields
      const err = result.error as any;
      const details =
        typeof err.flatten === "function"
          ? (err.flatten().fieldErrors ?? err.flatten().fields ?? {})
          : {};
      res.status(400).json({ error: "Dados inválidos", details });
      return;
    }
    req.body = result.data;
    next();
  };
