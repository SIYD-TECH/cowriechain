const { isAddress } = require("viem");
const { publicClient } = require("../config/blockchain");

/**
 * Reusable contract reader with type-safe bigInt conversion for JSON responses
 */
async function readContractSafe({ address, abi, functionName, args = [] }) {
  if (!address || !isAddress(address)) {
    throw new Error(`Invalid contract address: ${address}`);
  }

  const result = await publicClient.readContract({
    address,
    abi,
    functionName,
    args,
  });

  return serializeBigInt(result);
}

/**
 * Recursively converts BigInt values to string representation for JSON output
 */
function serializeBigInt(data) {
  if (typeof data === "bigint") {
    return data.toString();
  }
  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }
  if (data !== null && typeof data === "object") {
    const copy = {};
    for (const [key, val] of Object.entries(data)) {
      copy[key] = serializeBigInt(val);
    }
    return copy;
  }
  return data;
}

/**
 * Wait for a transaction receipt
 */
async function waitForReceipt(hash) {
  return await publicClient.waitForTransactionReceipt({ hash });
}

module.exports = {
  readContractSafe,
  serializeBigInt,
  waitForReceipt,
};

