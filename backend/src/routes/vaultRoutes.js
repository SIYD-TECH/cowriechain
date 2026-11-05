const express = require("express");
const router = express.Router();
const vaultController = require("../controllers/vaultController");
const { validateAddress } = require("../middleware/validate");

// GET /api/vaults/user/:userAddress - List all savings goals for a user
router.get("/user/:userAddress", validateAddress("userAddress"), vaultController.getUserGoals);

// GET /api/vaults/user/:userAddress/analytics - Savings adherence & total saved stats
router.get("/user/:userAddress/analytics", validateAddress("userAddress"), vaultController.getUserAnalytics);

// GET /api/vaults/user/:userAddress/goal/:goalId - Detailed goal view & progress
router.get("/user/:userAddress/goal/:goalId", validateAddress("userAddress"), vaultController.getGoalDetail);

// GET /api/vaults/user/:userAddress/goal/:goalId/preview-early-withdraw - Preview 10% penalty
router.get(
  "/user/:userAddress/goal/:goalId/preview-early-withdraw",
  validateAddress("userAddress"),
  vaultController.previewEarlyWithdraw
);

module.exports = router;

