process.env.NODE_ENV = "test";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const { serializeBigInt } = require("../src/services/blockchainService");
const { validateAddress, validatePagination } = require("../src/middleware/validate");

describe("Blockchain Service Serialization", () => {
  it("serializes BigInt to string", () => {
    assert.strictEqual(serializeBigInt(1000000000000000000n), "1000000000000000000");
  });

  it("serializes nested objects and arrays containing BigInt", () => {
    const input = {
      id: 1n,
      pot: 500000000n,
      members: ["0x111", "0x222"],
      rounds: [{ round: 0n, fee: 25000000n }],
    };
    const output = serializeBigInt(input);

    assert.strictEqual(output.id, "1");
    assert.strictEqual(output.pot, "500000000");
    assert.strictEqual(output.rounds[0].round, "0");
    assert.strictEqual(output.rounds[0].fee, "25000000");
  });
});

describe("Validation Middlewares", () => {
  it("rejects invalid EVM address in route params", () => {
    const middleware = validateAddress("userAddress");
    const req = { params: { userAddress: "0xinvalid-address-here" } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(s) {
        statusSent = s;
        return {
          json(j) {
            jsonSent = j;
          },
        };
      },
    };
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.error, "InvalidAddress");
    assert.strictEqual(nextCalled, false);
  });

  it("accepts valid EVM address in route params", () => {
    const middleware = validateAddress("userAddress");
    const req = { params: { userAddress: "0x71eB85002a3aA0A453B0cD3a4a085e51381F88b2" } };
    let nextCalled = false;

    middleware(req, {}, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
  });

  it("rejects invalid pagination parameters", () => {
    const req = { query: { offset: "-5", limit: "200" } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(s) {
        statusSent = s;
        return {
          json(j) {
            jsonSent = j;
          },
        };
      },
    };
    let nextCalled = false;

    validatePagination(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.error, "InvalidPagination");
    assert.strictEqual(nextCalled, false);
  });

  it("accepts valid pagination parameters and attaches to req", () => {
    const req = { query: { offset: "10", limit: "20" } };
    let nextCalled = false;

    validatePagination(req, {}, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.pagination.offset, 10);
    assert.strictEqual(req.pagination.limit, 20);
  });
});

describe("Express App Routing", () => {
  const app = require("../src/server");

  it("loads server without uncaught exceptions", () => {
    assert.ok(app);
  });
});
