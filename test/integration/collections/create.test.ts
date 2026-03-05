import { app } from "@/index";
import request from "supertest";

describe("POST /collections", () => {
  it("creates the collection", async () => {
    const res = await request(app)
      .post("/collections")
      .send({ name: "minha-nova-collection" })
      .set("Content-Type", "application/json");

    expect(res.statusCode).toEqual(201);
    expect(res.body._name).toBe("minha-nova-collection");
  });
});
