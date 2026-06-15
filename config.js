const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const env = process.env.NODE_ENV || "development";
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || "change_this_secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "8h";
const databasePath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, "simgec.db");
const isProduction = env === "production";

if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "")) {
  throw new Error("JWT_SECRET is required in production environment");
}

const dataDir = path.dirname(databasePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

module.exports = {
  env,
  port,
  jwtSecret,
  jwtExpiresIn,
  databasePath,
  isProduction,
};
