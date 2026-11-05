const { isAddress } = require("viem");

function validateAddress(paramName = "address", source = "params") {
  return (req, res, next) => {
    const value = req[source][paramName];
    if (!value || !isAddress(value, { strict: false })) {
      return res.status(400).json({
        error: "InvalidAddress",
        message: `Field '${paramName}' must be a valid 20-byte EVM address. Received: '${value}'`,
      });
    }
    next();
  };
}

function validatePagination(req, res, next) {
  const offset = parseInt(req.query.offset || "0", 10);
  const limit = parseInt(req.query.limit || "10", 10);

  if (isNaN(offset) || offset < 0) {
    return res.status(400).json({ error: "InvalidPagination", message: "offset must be a non-negative integer." });
  }

  if (isNaN(limit) || limit <= 0 || limit > 100) {
    return res.status(400).json({ error: "InvalidPagination", message: "limit must be between 1 and 100." });
  }

  req.pagination = { offset, limit };
  next();
}

module.exports = {
  validateAddress,
  validatePagination,
};
