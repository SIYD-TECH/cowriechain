const express = require("express");
const router = express.Router();
const env = require("../config/env");
const { publicClient } = require("../config/blockchain");

router.get("/", async (req, res) => {
  let rpcHealthy = false;
  let blockNumber = null;

  try {
    const block = await publicClient.getBlockNumber();
    blockNumber = block.toString();
    rpcHealthy = true;
  } catch (err) {
    rpcHealthy = false;
  }

  res.json({
    status: "ok",
    service: "CowrieChain Backend API & Keeper Relayer",
    chainId: env.CHAIN_ID,
    network: "Ethereum Sepolia",
    rpcConnected: rpcHealthy,
    latestBlock: blockNumber,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

