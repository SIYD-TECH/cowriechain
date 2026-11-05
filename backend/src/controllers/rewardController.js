const rewardService = require("../services/rewardService");

async function getUserRewards(req, res, next) {
  try {
    const { userAddress } = req.params;
    const rewards = await rewardService.getUserPoints(userAddress);
    res.json({ success: true, rewards });
  } catch (err) {
    next(err);
  }
}

async function getLeaderboard(req, res, next) {
  try {
    const leaderboard = await rewardService.getLeaderboard();
    res.json({ success: true, ...leaderboard });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserRewards,
  getLeaderboard,
};

