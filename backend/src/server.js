const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");

const healthRoutes = require("./routes/healthRoutes");
const circleRoutes = require("./routes/circleRoutes");
const vaultRoutes = require("./routes/vaultRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const relayerRoutes = require("./routes/relayerRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security headers
app.use(helmet());

// Dynamic CORS configuration for development and Render production
const isProduction = process.env.NODE_ENV === "production";
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (curl, server-to-server, relayer bot, health checks)
    if (!origin) return callback(null, true);

    // 2. Allow local development origins in non-production environments
    if (!isProduction) {
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }
    }

    // 3. Allow explicit wildcard origin if configured
    if (configuredOrigins.includes("*")) {
      return callback(null, true);
    }

    // 4. Default safe fallback for Vercel preview & production deployments if no origins configured
    const effectiveOrigins =
      configuredOrigins.length > 0
        ? configuredOrigins
        : ["https://cowriechain.vercel.app", "https://*.vercel.app"];

    const isAllowed = effectiveOrigins.some((pattern) => {
      if (pattern === origin) return true;
      if (pattern.includes("*")) {
        const regex = new RegExp(
          "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
        );
        return regex.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

// API Endpoints
app.use("/api/health", healthRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api/vaults", vaultRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/relayer", relayerRoutes);

// Root path fallback
app.get("/", (req, res) => {
  res.json({
    name: "CowrieChain API",
    status: "online",
    docs: "/api/health",
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NotFound",
    message: `Route '${req.method} ${req.originalUrl}' not found.`,
  });
});

// Centralized error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(env.PORT, () => {
    console.log(
      `[CowrieChain] Backend server listening on port ${env.PORT} (Chain ID: ${env.CHAIN_ID})`
    );
  });
}

module.exports = app;
