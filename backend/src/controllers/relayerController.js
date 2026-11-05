const relayerService = require("../services/relayerService");

async function checkEligibility(req, res, next) {
  try {
    const { circleAddress } = req.params;
    const status = await relayerService.checkEligibility(circleAddress);
    res.json({ success: true, ...status });
  } catch (err) {
    next(err);
  }
}

async function triggerResolveRound(req, res, next) {
  try {
    const { circleAddress } = req.body;
    if (!circleAddress) {
      return res.status(400).json({ success: false, error: "Missing circleAddress in request body." });
    }

    const result = await relayerService.executeResolveRound(circleAddress);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const history = relayerService.getExecutionHistory();
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkEligibility,
  triggerResolveRound,
  getHistory,
};

