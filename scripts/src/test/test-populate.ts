import { parseMarkdownFile } from "@/database/populate-strapi";
import { questionPath } from "@/lib/get-path";

// Test the markdown parsing functionality
function testMarkdownParsing(): void {
  console.log("🧪 Testing Markdown Parsing...\n");
  
  try {
    const testFile = "ganga-questions.md";
    const filepath = questionPath(testFile);
    
    console.log(`📄 Parsing file: ${filepath}`);
    const result = parseMarkdownFile(filepath);
    
    console.log(`✅ Found ${result.questions.length} questions`);
    
    if (result.questions.length > 0) {
      const firstQuestion = result.questions[0];
      console.log("\n📝 First question preview:");
      console.log(`   Question: ${firstQuestion.question.substring(0, 100)}...`);
      console.log(`   Options: A) ${firstQuestion.options.A.substring(0, 50)}...`);
      console.log(`   Correct: ${firstQuestion.correctOption}`);
      console.log(`   Difficulty: ${firstQuestion.difficulty}`);
    }
    
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run tests
if (require.main === module) {
  testMarkdownParsing();
}