const vaultService = require("../services/vaultService");

async function getUserGoals(req, res, next) {
  try {
    const { userAddress } = req.params;
    const goals = await vaultService.getGoals(userAddress);
    res.json({ success: true, userAddress, count: goals.length, goals });
  } catch (err) {
    next(err);
  }
}

async function getGoalDetail(req, res, next) {
  try {
    const { userAddress, goalId } = req.params;
    const goal = await vaultService.getGoal(userAddress, goalId);
    res.json({ success: true, goal });
  } catch (err) {
    next(err);
  }
}

async function previewEarlyWithdraw(req, res, next) {
  try {
    const { userAddress, goalId } = req.params;
    const preview = await vaultService.previewEarlyWithdraw(userAddress, goalId);
    res.json({ success: true, userAddress, goalId, ...preview });
  } catch (err) {
    next(err);
  }
}

async function getUserAnalytics(req, res, next) {
  try {
    const { userAddress } = req.params;
    const analytics = await vaultService.getUserAnalytics(userAddress);
    res.json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserGoals,
  getGoalDetail,
  previewEarlyWithdraw,
  getUserAnalytics,
};

