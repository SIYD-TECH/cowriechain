const env = require("../config/env");

/**
 * Optional authentication for keeper relayer execution endpoints.
 * If RELAYER_API_KEY is configured in backend/.env, requires 'x-api-key' or 'Authorization: Bearer <token>'.
 */
function requireRelayerAuth(req, res, next) {
  if (!env.RELAYER_API_KEY) {
    // If no key is configured in dev, proceed (or reject if production)
    if (env.NODE_ENV === "production") {
      return res.status(403).json({
        error: "RelayerNotConfigured",
        message: "Relayer API key must be configured in production.",
      });
    }
    return next();
  }

  const apiKeyHeader = req.headers["x-api-key"];
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const providedKey = apiKeyHeader || bearerToken;
  if (!providedKey || providedKey !== env.RELAYER_API_KEY) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Valid relayer API key is required to invoke automated keeper execution.",
    });
  }

  next();
}

module.exports = {
  requireRelayerAuth,
};

