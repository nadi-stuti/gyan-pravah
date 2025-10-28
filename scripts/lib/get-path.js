// ...existing code...
const path = require("path");
const loadDotenv = require("./load-dotenv");

// repo root is two levels up from scripts/lib
const repoRoot = path.resolve(__dirname, "..", "..");


const rawContentDir = process.env.CONTENT_DIRECTORY;
if (!rawContentDir) {
  throw new Error("CONTENT_DIRECTORY environment variable is not set");
}
const contentDir = path.resolve(repoRoot, rawContentDir);

const questionsDir = process.env.QUESTIONS_DIRECTORY;
if (!questionsDir) {
  throw new Error("QUESTIONS_DIRECTORY environment variable is not set");
}

/**
 * Return the absolute path to a markdown file located in the questions directory.
 * @param {string} markDown - filename or relative path of the markdown file (e.g. "ganga-questions.md" or "subdir/file.md")
 * @returns {string} absolute path to the markdown file
 */
function questionPath(markDown) {
  if (!markDown || typeof markDown !== "string") {
    throw new TypeError("markDown must be a non-empty string");
  }
  const md = stripQuotes(markDown);
  const fullPath = path.resolve(contentDir, questionsDir, md);
  return fullPath;
}

function allQuestionsPath() {
  return path.resolve(contentDir, questionsDir);
}

module.exports = { questionPath, allQuestionsPath };
