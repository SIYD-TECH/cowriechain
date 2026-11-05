const vaultService = require("./vaultService");
const circleService = require("./circleService");

class RewardService {
  /**
   * Computes consistency points for a given user.
   * Rules:
   * - 500 pts per completed savings vault without early withdrawal
   * - 200 pts per on-time circle contribution
   * - 0 pts (penalty) if defaulted in a circle
   */
  async getUserPoints(userAddress) {
    let points = 0;
    const badges = [];

    // 1. Vault points
    try {
      const analytics = await vaultService.getUserAnalytics(userAddress);
      points += analytics.completedGoals * 500;
      if (analytics.completedGoals >= 3) {
        badges.push("Master Disciplined Saver");
      }
    } catch {
      // Ignore if contracts unconfigured in dev
    }

    // 2. Circle points
    try {
      const circles = await circleService.getUserCircles(userAddress);
      let onTimePayments = 0;
      let hasDefaulted = false;

      for (const c of circles) {
        if (c.userStatus?.isMember) {
          if (c.userStatus.defaulted) {
            hasDefaulted = true;
          } else {
            onTimePayments++;
          }
        }
      }

      points += onTimePayments * 200;
      if (!hasDefaulted && onTimePayments > 0) {
        badges.push("Reliable Circle Member");
      }
    } catch {
      // Ignore if unconfigured
    }

    let tier = "Bronze";
    if (points >= 2000) tier = "Gold";
    else if (points >= 1000) tier = "Silver";

    return {
      userAddress,
      points,
      tier,
      badges,
      epoch: 1,
      nextDistribution: "Quarterly",
    };
  }

  async getLeaderboard() {
    return {
      epoch: 1,
      totalPoolReward: "50000",
      topSavers: [
        { rank: 1, address: "0x71e...88b2", points: 2450, tier: "Gold" },
        { rank: 2, address: "0x4a2...91c0", points: 1850, tier: "Silver" },
        { rank: 3, address: "0x9c1...33de", points: 1240, tier: "Silver" },
      ],
    };
  }
}

module.exports = new RewardService();

