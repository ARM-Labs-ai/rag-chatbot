import { app } from "@/index";
import request from "supertest";

describe("POST /collections", () => {
  it("creates the collection", async () => {
    const res = await request(app)
      .post("/collections")
      .send({ name: "minha-nova-collection" })
      .set("Content-Type", "application/json");

    //console.log("===> request", res);
    expect(res.statusCode).toEqual(201);
  });
});
