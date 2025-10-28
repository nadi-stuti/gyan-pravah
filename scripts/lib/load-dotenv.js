const path = require("path");
const dotenv = require("dotenv");

const dotenvPath = path.resolve(__dirname, "..", ".env");
const dotenvResult = dotenv.config({ path: dotenvPath });
if (dotenvResult.error) {
  console.warn(
    "dotenv: failed to load .env from",
    dotenvPath,
    "-",
    dotenvResult.error.message
  );
}

module.exports = dotenvResult;
