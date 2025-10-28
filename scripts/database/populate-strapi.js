// Strapi Population Script for Gyan Pravah Quiz App
// Version 3 - Fixed for Strapi v5 Draft & Publish system

const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();
const { allQuestionsPath } = require("../lib/get-path");
const { ALL_SUBTOPICS,TOPICS } = require("../../content/listing/topics-list");


// ==================== CONFIGURATION ====================
const CONFIG = {
  strapiUrl: process.env.STRAPI_URL || "http://localhost:1337",
  apiToken: process.env.STRAPI_API_TOKEN || "",
  markdownFilesDir: allQuestionsPath(),
};

// ==================== API SETUP ====================
const api = axios.create({
  baseURL: `${CONFIG.strapiUrl}/api`,
  headers: {
    Authorization: `Bearer ${CONFIG.apiToken}`,
    "Content-Type": "application/json",
  },
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse markdown file and extract questions
 */
function parseMarkdownFile(filepath) {
  if (!fs.existsSync(filepath)) {
    console.warn(`  ⚠️  File not found: ${filepath}`);
    return { questions: [] };
  }

  let content = fs.readFileSync(filepath, "utf-8");
  content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const questions = [];

  const questionPattern =
    /### Question (\d+)\s*\*\*Q:\*\*\s*(.+?)\s*\*\*A\)\*\*\s*(.+?)\s*\*\*B\)\*\*\s*(.+?)\s*\*\*C\)\*\*\s*(.+?)\s*\*\*D\)\*\*\s*(.+?)\s*\*\*Correct Answer:\*\*\s*([A-D])\s*\*\*Difficulty:\*\*\s*(.+?)\s*\*\*Explanation:\*\*\s*(.+?)(?=\n###|\n---|\n##|$)/gs;

  let match;
  while ((match = questionPattern.exec(content)) !== null) {
    const [
      ,
      number,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      difficulty,
      explanation,
    ] = match;
    questions.push({
      questionNumber: parseInt(number),
      question: questionText.trim(),
      options: {
        A: optionA.trim(),
        B: optionB.trim(),
        C: optionC.trim(),
        D: optionD.trim(),
      },
      correctOption: correctAnswer.trim(),
      difficulty: difficulty.trim(),
      explanation: explanation.trim(),
    });
  }

  return { questions };
}

/**
 * Fetch existing entry by slug (uses documentId from Strapi v5)
 */
async function fetchBySlug(endpoint, slug) {
  try {
    const response = await api.get(
      `${endpoint}?filters[slug][$eq]=${slug}&status=published`
    );
    const items = response.data.data;
    return items && items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error(
      `Error fetching ${endpoint} by slug "${slug}":`,
      error.message
    );
    return null;
  }
}

/**
 * Create or get topic (uses documentId)
 */
async function createOrGetTopic(topicData) {
  try {
    // Check if exists
    const existing = await fetchBySlug("/quiz-topics", topicData.slug);
    if (existing) {
      console.log(
        `  ↻ Topic already exists: ${topicData.topicName} (documentId: ${existing.documentId})`
      );
      return existing;
    }

    // Create with status=published to avoid draft creation
    const response = await api.post("/quiz-topics?status=published", {
      data: {
        topicName: topicData.topicName,
        slug: topicData.slug,
        topicIcon: topicData.topicIcon,
      },
    });

    const created = response.data.data;
    console.log(
      `  ✓ Created topic: ${topicData.topicName} (documentId: ${created.documentId})`
    );
    return created;
  } catch (error) {
    console.error(
      `  ✗ Error with topic "${topicData.topicName}":`,
      error.response?.data || error.message
    );
    return null;
  }
}

/**
 * Create or get subtopic (uses documentId for relations)
 */
async function createOrGetSubtopic(subtopicData, topicDocumentId) {
  try {
    // Check if exists
    const existing = await fetchBySlug("/quiz-subtopics", subtopicData.slug);
    if (existing) {
      console.log(
        `    ↻ Subtopic already exists: ${subtopicData.name} (documentId: ${existing.documentId})`
      );
      return existing;
    }

    // Create published directly (avoids draft)
    const response = await api.post("/quiz-subtopics?status=published", {
      data: {
        name: subtopicData.name,
        slug: subtopicData.slug,
        quiz_topic: topicDocumentId, // Use documentId for relation
      },
    });

    const created = response.data.data;
    console.log(
      `    ✓ Created subtopic: ${subtopicData.name} (documentId: ${created.documentId})`
    );
    return created;
  } catch (error) {
    console.error(
      `    ✗ Error with subtopic "${subtopicData.name}":`,
      error.response?.data || error.message
    );
    return null;
  }
}

/**
 * Create question (uses documentId for relations)
 */
async function createQuestion(
  questionData,
  subtopicDocumentId,
  topicDocumentId
) {
  try {
    // Normalize question text for exact-match lookup
    const questionText = (questionData.question || "").trim();
    if (!questionText) {
      console.warn("      ⚠️  Empty question text, skipping");
      return null;
    }

    // Check if an identical question already exists (published)
    try {
      const encodedQ = encodeURIComponent(questionText);
      const existingResp = await api.get(
        `/quiz-questions?filters[question][$eq]=${encodedQ}&status=published`
      );
      const existingItems = existingResp.data.data;
      if (existingItems && existingItems.length > 0) {
        console.log(
          `      ↻ Question already exists, skipping: "${questionText.substring(
            0,
            80
          )}..."`
        );
        return existingItems[0];
      }
    } catch (fetchErr) {
      // Non-fatal: continue to attempt creation if lookup fails
      console.warn(
        "      ⚠️  Failed to check existing question, proceeding to create:",
        fetchErr.message || fetchErr
      );
    }

    const response = await api.post("/quiz-questions?status=published", {
      data: {
        question: questionData.question,
        options: questionData.options,
        correctOption: questionData.correctOption,
        difficulty: questionData.difficulty.trim(),
        explanation: questionData.explanation,
        quiz_subtopic: subtopicDocumentId, // Use documentId
        quiz_topic: topicDocumentId, // Use documentId
      },
    });

    return response.data.data;
  } catch (error) {
    console.error(
      `      ✗ Error creating question: ${questionData.question.substring(
        0,
        50
      )}...`
    );
    console.error(
      `         ${error.response?.data?.error?.message || error.message}`
    );
    return null;
  }
}

/**
 * Clear all data (using documentId)
 */
async function clearAllData() {
  console.log("\n⚠️  CLEARING ALL DATA...\n");

  try {
    const collections = ["quiz-questions", "quiz-subtopics", "quiz-topics"];

    for (const collection of collections) {
      const response = await api.get(`/${collection}?status=published`);
      const items = response.data.data;

      for (const item of items) {
        // Use documentId for deletion in Strapi v5
        await api.delete(`/${collection}/${item.documentId}`);
      }
      console.log(`✓ Cleared ${items.length} ${collection}`);
    }

    console.log("\n✅ All data cleared.\n");
  } catch (error) {
    console.error("❌ Error clearing data:", error.message);
  }
}

/**
 * Main populate function
 */
async function populateStrapi() {
  console.log("\n🚀 Starting Strapi Population (v5 Compatible)...\n");

  const stats = {
    topicsCreated: 0,
    subtopicsCreated: 0,
    questionsCreated: 0,
  };

  try {
    // Check if --clear flag is passed
    if (process.argv.includes("--clear")) {
      await clearAllData();
    }

    // STEP 1: Create Topics
    console.log("━".repeat(50));
    console.log("📚 STEP 1: Creating Topics");
    console.log("━".repeat(50) + "\n");

    const topicMap = {};
    for (const topic of TOPICS) {
      const createdTopic = await createOrGetTopic(topic);
      if (createdTopic) {
        topicMap[topic.slug] = createdTopic;
        stats.topicsCreated++;
      }
    }

    console.log(`\n✅ Topics ready: ${stats.topicsCreated}\n`);

    // STEP 2: Create Subtopics & Questions
    console.log("━".repeat(50));
    console.log("📖 STEP 2: Creating Subtopics & Questions");
    console.log("━".repeat(50) + "\n");

    for (const [index, subtopic] of ALL_SUBTOPICS.entries()) {
      console.log(
        `\n[${index + 1}/${ALL_SUBTOPICS.length}] Processing: ${subtopic.name}`
      );
      console.log("─".repeat(50));

      const topic = topicMap[subtopic.topicSlug];
      if (!topic) {
        console.log(`  ✗ Topic "${subtopic.topicSlug}" not found, skipping...`);
        continue;
      }

      // Create subtopic with documentId
      const subtopicSlug = subtopic.name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
      const createdSubtopic = await createOrGetSubtopic(
        { name: subtopic.name, slug: subtopicSlug },
        topic.documentId // Pass documentId not id
      );

      if (!createdSubtopic) {
        console.log(`    ✗ Failed to create subtopic, skipping questions...`);
        continue;
      }

      stats.subtopicsCreated++;

      // Check if file exists, if null then skip question generation
      if (!subtopic.file) {
        console.log(`    🔜 Coming Soon: No questions file specified for ${subtopic.name}`);
        console.log(`    ✅ Subtopic created (0 questions - Coming Soon)`);
        continue;
      }

      // Parse and create questions
      const filepath = path.join(CONFIG.markdownFilesDir, subtopic.file);
      const { questions } = parseMarkdownFile(filepath);

      if (!questions.length) {
        console.log(`    ⚠️  No questions found in ${subtopic.file}`);
        console.log(`    ✅ Subtopic created (0 questions - Coming Soon)`);
        continue;
      }

      console.log(`    📝 Creating ${questions.length} questions...`);

      for (const q of questions) {
        const created = await createQuestion(
          q,
          createdSubtopic.documentId,
          topic.documentId
        );
        if (created) stats.questionsCreated++;
      }

      console.log(`    ✅ Done with subtopic: ${subtopic.name} (${questions.length} questions)`);
    }

    // Final Summary
    console.log("\n" + "━".repeat(50));
    console.log("✅ POPULATION COMPLETE!");
    console.log("━".repeat(50));
    console.log(`Topics: ${stats.topicsCreated}`);
    console.log(`Subtopics: ${stats.subtopicsCreated}`);
    console.log(`Questions: ${stats.questionsCreated}`);
    console.log("━".repeat(50) + "\n");
  } catch (error) {
    console.error("❌ Population failed:", error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  populateStrapi();
}

// Export for testing
module.exports = {
  populateStrapi,
  parseMarkdownFile,
  clearAllData,
  createOrGetTopic,
  createOrGetSubtopic,
  createQuestion,
};
