import { app } from "@/index";
import request from "supertest";
import { createCollection } from "../../helpers/chromadb";

describe("DELETE /collections/:collectionName", () => {
  beforeAll(async () => {
    createCollection("test-collection");
  });

  it("deletes the collection", async () => {
    const res = await request(app)
      .delete("/collections/test-collection")
      .set("Content-Type", "application/json");

    expect(res.statusCode).toEqual(200);
  });
});
