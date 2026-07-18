import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "../services/passwordService";

describe("password service", () => {
  it("hashes passwords with Argon2id and verifies the correct password", async () => {
    const password = "StrongPass123!";
    const hash = await hashPassword(password);

    assert.match(hash, /^\$argon2id\$/);
    assert.notEqual(hash, password);
    assert.equal(await verifyPassword(hash, password), true);
    assert.equal(await verifyPassword(hash, "WrongPass123!"), false);
  });
});
