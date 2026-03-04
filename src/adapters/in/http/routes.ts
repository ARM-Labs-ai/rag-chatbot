import { Router } from "express";
import { execute as list } from "@use-cases/list-collections";
import { execute as create } from "@use-cases/create-collection";

export const router = Router()
  .get("/", async (_req, res) => {
    const result = await list();

    res.status(200).json(result);
  })
  .post("/", async (req, res) => {
    const result = await create(req.body.name);

    res.status(201).json(result);

    res.status(200).json(result);
  });
