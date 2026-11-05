const { readContractSafe } = require("./blockchainService");
const { SAVINGS_VAULT_ABI, ADDRESSES } = require("../config/contracts");

class VaultService {
  getVaultAddress() {
    return ADDRESSES.savingsVault;
  }

  async getGoals(userAddress) {
    const vault = this.getVaultAddress();
    if (!vault) return [];

    const goals = await readContractSafe({
      address: vault,
      abi: SAVINGS_VAULT_ABI,
      functionName: "getGoals",
      args: [userAddress],
    });

    return goals.map((g, index) => ({
      goalId: index,
      name: g.name,
      target: g.target,
      deadline: g.deadline,
      saved: g.saved,
      withdrawn: g.withdrawn,
    }));
  }

  async getGoal(userAddress, goalId) {
    const vault = this.getVaultAddress();
    if (!vault) throw new Error("SavingsVault address not configured");

    const goal = await readContractSafe({
      address: vault,
      abi: SAVINGS_VAULT_ABI,
      functionName: "getGoal",
      args: [userAddress, BigInt(goalId)],
    });

    const [progressBps, isWithdrawable] = await Promise.all([
      readContractSafe({
        address: vault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "progressBps",
        args: [userAddress, BigInt(goalId)],
      }),
      readContractSafe({
        address: vault,
        abi: SAVINGS_VAULT_ABI,
        functionName: "isWithdrawable",
        args: [userAddress, BigInt(goalId)],
      }),
    ]);

    return {
      goalId: parseInt(goalId, 10),
      ...goal,
      progressBps,
      isWithdrawable,
    };
  }

  async previewEarlyWithdraw(userAddress, goalId) {
    const vault = this.getVaultAddress();
    if (!vault) throw new Error("SavingsVault address not configured");

    const [payout, penalty] = await readContractSafe({
      address: vault,
      abi: SAVINGS_VAULT_ABI,
      functionName: "previewEarlyWithdraw",
      args: [userAddress, BigInt(goalId)],
    });

    return { payout, penalty, penaltyBps: 1000 };
  }

  async getUserAnalytics(userAddress) {
    const goals = await this.getGoals(userAddress);

    let totalSaved = 0n;
    let completedGoals = 0;
    let activeGoals = 0;

    for (const g of goals) {
      totalSaved += BigInt(g.saved);
      if (g.withdrawn) {
        completedGoals++;
      } else {
        activeGoals++;
      }
    }

    const totalGoals = goals.length;
    const adherenceRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 100;

    return {
      userAddress,
      totalSaved: totalSaved.toString(),
      totalGoals,
      activeGoals,
      completedGoals,
      adherenceRate: `${adherenceRate}%`,
    };
  }
}

module.exports = new VaultService();

