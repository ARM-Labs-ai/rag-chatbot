import { app } from "@/app";
import request from "supertest";
import { clearDatabase, createCollection } from "../../helpers/chromadb";

describe("GET /collections", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("returns the collection list", async () => {
    const res = await request(app)
      .get("/collections");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it("returns a collection list", async () => {
    const collection = await createCollection("collect");

    const res = await request(app)
      .get("/collections");

    expect(res.statusCode).toEqual(200);
    expect(res.body[0]._name).toBe("collect");
  });
});
