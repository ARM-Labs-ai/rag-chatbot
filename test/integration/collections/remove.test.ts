import { app } from "@/index";
import request from "supertest";
import { clearDatabase, createCollection, deleteCollection } from "../../helpers/chromadb";

describe("DELETE /collections/:collectionName", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("deletes the collection", async () => {
    await createCollection("test-collection");

    const res = await request(app)
      .delete("/collections/test-collection")
      .set("Content-Type", "application/json");

    expect(res.statusCode).toEqual(200);
  });
});
