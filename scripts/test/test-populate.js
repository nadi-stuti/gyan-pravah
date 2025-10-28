const { parseMarkdownFile } = require("../database/populate-strapi.js");
const { questionPath } = require("../lib/get-path.js");

const filePath = questionPath("ganga-questions.md");
const allowedDifficulties = ["Easy", "Medium", "Hard"];

(async () => {
  console.log("Testing markdown parser...");
  console.log("Using file:", filePath);

  try {
    const resultOrPromise = parseMarkdownFile(filePath);
    const result =
      resultOrPromise && typeof resultOrPromise.then === "function"
        ? await resultOrPromise
        : resultOrPromise;

    const count = Array.isArray(result && result.questions)
      ? result.questions.length
      : 0;
    console.log("Questions found:", count);
    console.log(result.questions[20]);
    process.exit(0);
  } catch (err) {
    console.error(
      "Error running parser:",
      err && err.message ? err.message : err
    );
    process.exit(1);
  }
})();
