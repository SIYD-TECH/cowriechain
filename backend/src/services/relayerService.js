const circleService = require("./circleService");
const { GROUP_SAVE_ABI } = require("../config/contracts");
const { relayerWalletClient, relayerAccount } = require("../config/blockchain");
const { waitForReceipt } = require("./blockchainService");

// Mutex lock to prevent duplicate concurrent keeper executions on the same circle
const activeLocks = new Set();
const executionHistory = [];

class RelayerService {
  async checkEligibility(circleAddress) {
    const canResolve = await circleService.canResolve(circleAddress);
    return {
      circleAddress,
      canResolve,
      isLocked: activeLocks.has(circleAddress.toLowerCase()),
    };
  }

  async executeResolveRound(circleAddress) {
    const norm = circleAddress.toLowerCase();

    if (activeLocks.has(norm)) {
      throw new Error(`Execution already in progress for circle ${circleAddress}`);
    }

    if (!relayerWalletClient || !relayerAccount) {
      throw new Error("Relayer signing account is not configured on the server.");
    }

    // 1. Verify eligibility
    const canResolve = await circleService.canResolve(circleAddress);
    if (!canResolve) {
      throw new Error("Circle is not eligible for resolution (grace period not expired or circle not active).");
    }

    // 2. Acquire lock
    activeLocks.add(norm);

    try {
      // 3. Broadcast resolveRound tx
      const txHash = await relayerWalletClient.writeContract({
        address: circleAddress,
        abi: GROUP_SAVE_ABI,
        functionName: "resolveRound",
        account: relayerAccount,
      });

      // 4. Wait for receipt
      const receipt = await waitForReceipt(txHash);

      const record = {
        circleAddress,
        transactionHash: txHash,
        status: receipt.status === "success" ? "resolved" : "failed",
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString(),
      };

      executionHistory.unshift(record);
      if (executionHistory.length > 50) executionHistory.pop();

      return record;
    } finally {
      activeLocks.delete(norm);
    }
  }

  getExecutionHistory() {
    return executionHistory;
  }
}

module.exports = new RelayerService();

