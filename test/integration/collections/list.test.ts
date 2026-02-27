import { app } from "@/index";
import request from "supertest";
import { createCollection } from "../../helpers/chromadb";

describe('GET /collections', () => {
  beforeAll(async () => {
    // await createCollection();
  });

  it("returns the collection list", async () => {
    const res = await request(app)
      .get("/collections");

    expect(res.statusCode).toEqual(200);
    expect(res.body[0]).toEqual([]);
  });
});
