import path from "path";
import dotenv from "dotenv";

const dotenvPath = path.resolve(__dirname, "..", "..", ".env");
const dotenvResult = dotenv.config({ path: dotenvPath });

if (dotenvResult.error) {
  console.warn(
    "dotenv: failed to load .env from",
    dotenvPath,
    "-",
    dotenvResult.error.message
  );
}

export default dotenvResult;