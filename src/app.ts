import express from "express";
import { router as collectionsRouter } from "@/adapters/in/http/routes";

export const app = express()
  .use(express.json())
  .use("/collections", collectionsRouter);
