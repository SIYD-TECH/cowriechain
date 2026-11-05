const express = require("express");
const router = express.Router();
const relayerController = require("../controllers/relayerController");
const { validateAddress } = require("../middleware/validate");
const { requireRelayerAuth } = require("../middleware/auth");

// GET /api/relayer/check/:circleAddress - Check if a circle is eligible for resolveRound()
router.get("/check/:circleAddress", validateAddress("circleAddress"), relayerController.checkEligibility);

// POST /api/relayer/resolve-round - Authenticated endpoint for keeper bot to execute resolveRound()
router.post("/resolve-round", requireRelayerAuth, relayerController.triggerResolveRound);

// GET /api/relayer/history - View recent keeper execution receipts
router.get("/history", relayerController.getHistory);

module.exports = router;

