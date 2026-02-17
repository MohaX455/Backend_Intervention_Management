import request from "supertest";
import { createApp } from "../../../src/app/app";
import { createTestUser } from "../../fixture/user.fixture";
import { describe, expect, it } from "vitest";

const app = createApp();

describe("POST /auth/login", () => {

    it("should login successfully", async () => {

        await createTestUser();

        const response = await request(app)
            .post("/auth/login")
            .send({
                name: "testuser",
                password: "Password123"
            });

        expect(response.status).toBe(200);
        expect(response.headers["set-cookie"]).toBeDefined();
    });

});
