const circleService = require("../services/circleService");

async function getCircles(req, res, next) {
  try {
    const { offset = 0, limit = 10 } = req.pagination || {};
    const result = await circleService.getCircles(offset, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getUserCircles(req, res, next) {
  try {
    const { userAddress } = req.params;
    const circles = await circleService.getUserCircles(userAddress);
    res.json({ success: true, userAddress, count: circles.length, circles });
  } catch (err) {
    next(err);
  }
}

async function getCircleDetails(req, res, next) {
  try {
    const { circleAddress } = req.params;
    const [info, members, payoutOrder, canResolve] = await Promise.all([
      circleService.getCircleInfo(circleAddress),
      circleService.getMembers(circleAddress),
      circleService.getPayoutOrder(circleAddress),
      circleService.canResolve(circleAddress),
    ]);

    res.json({
      success: true,
      circleAddress,
      info,
      members,
      payoutOrder,
      canResolve,
    });
  } catch (err) {
    next(err);
  }
}

async function getMemberStatus(req, res, next) {
  try {
    const { circleAddress, userAddress } = req.params;
    const [memberInfo, amountDue] = await Promise.all([
      circleService.getMemberInfo(circleAddress, userAddress),
      circleService.getAmountDue(circleAddress, userAddress),
    ]);

    res.json({
      success: true,
      circleAddress,
      userAddress,
      memberInfo,
      amountDue,
    });
  } catch (err) {
    next(err);
  }
}

async function createInvite(req, res, next) {
  try {
    const { circleAddress, invitee } = req.body;
    if (!circleAddress || !invitee) {
      return res.status(400).json({ success: false, error: "Missing circleAddress or invitee" });
    }
    const record = circleService.recordInvite(circleAddress, invitee);
    res.json({ success: true, record });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCircles,
  getUserCircles,
  getCircleDetails,
  getMemberStatus,
  createInvite,
};

