import { app } from "@/index";
import request from "supertest";

describe("POST /sessions", () => {
  it("create a session", async () => {
    const res = await request(app)
      .post("/sessions")
      .send({
        collectionName: "first collection",
        systemPrompt: "system prompt"
      })
      .set("Content-Type", "application/json");

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBe("oi");
  });
});
