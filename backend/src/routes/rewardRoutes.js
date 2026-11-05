const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/rewardController");
const { validateAddress } = require("../middleware/validate");

// GET /api/rewards/user/:userAddress - Points and consistency score for user
router.get("/user/:userAddress", validateAddress("userAddress"), rewardController.getUserRewards);

// GET /api/rewards/leaderboard - Community leaderboard
router.get("/leaderboard", rewardController.getLeaderboard);

module.exports = router;

