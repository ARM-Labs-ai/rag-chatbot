import { Router } from "express";
import { execute } from "@use-cases/list-collections";

export const router = Router()
  .get("/", async (_req, res) => {
    const result = await execute();

    res.status(200).json(result);
  });
