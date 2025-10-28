import path from "path";
import "./load-dotenv";

// repo root is three levels up from scripts/src/lib
const repoRoot = path.resolve(__dirname, "..", "..", "..");

const rawContentDir = process.env.CONTENT_DIRECTORY;
if (!rawContentDir) {
  throw new Error("CONTENT_DIRECTORY environment variable is not set");
}
const contentDir = path.resolve(repoRoot, rawContentDir);

const questionsDir = process.env.QUESTIONS_DIRECTORY;
if (!questionsDir) {
  throw new Error("QUESTIONS_DIRECTORY environment variable is not set");
}

// Type assertion after null check
const questionsDirectory: string = questionsDir;

function stripQuotes(str: string): string {
  return str.replace(/^["']|["']$/g, '');
}

/**
 * Return the absolute path to a markdown file located in the questions directory.
 * @param markDown - filename or relative path of the markdown file (e.g. "ganga-questions.md" or "subdir/file.md")
 * @returns absolute path to the markdown file
 */
export function questionPath(markDown: string): string {
  if (!markDown || typeof markDown !== "string") {
    throw new TypeError("markDown must be a non-empty string");
  }
  const md = stripQuotes(markDown);
  const fullPath = path.resolve(contentDir, questionsDirectory, md);
  return fullPath;
}

export function allQuestionsPath(): string {
  return path.resolve(contentDir, questionsDirectory);
}