import { app } from "@/index";
import request from "supertest";
import { clearDatabase, createCollection } from "../../helpers/chromadb";

describe("GET /collections", () => {
  it("returns the collection list", async () => {
    const res = await request(app)
      .get("/collections");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });
});
