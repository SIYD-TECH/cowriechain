const express = require("express");
const router = express.Router();
const circleController = require("../controllers/circleController");
const { validateAddress, validatePagination } = require("../middleware/validate");

// GET /api/circles?offset=0&limit=10 - List all circles from factory
router.get("/", validatePagination, circleController.getCircles);

// GET /api/circles/user/:userAddress - List circles for a specific wallet
router.get("/user/:userAddress", validateAddress("userAddress"), circleController.getUserCircles);

// GET /api/circles/:circleAddress - Detail, members, and payout order for a circle
router.get("/:circleAddress", validateAddress("circleAddress"), circleController.getCircleDetails);

// GET /api/circles/:circleAddress/member/:userAddress - Member contribution & dues status
router.get(
  "/:circleAddress/member/:userAddress",
  validateAddress("circleAddress"),
  validateAddress("userAddress"),
  circleController.getMemberStatus
);

// POST /api/circles/invite - Off-chain invite generation / tracker
router.post("/invite", circleController.createInvite);

module.exports = router;

