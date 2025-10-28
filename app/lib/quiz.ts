import { fetchFromStrapi } from "./strapi";
import { 
  QuizTopicsResponse, 
  QuizSubtopicsResponse, 
  QuizQuestionsResponse 
} from "@gyan-pravah/types";

export async function getQuizTopics(): Promise<QuizTopicsResponse> {
  // Populate the quiz_subtopics relation
  return fetchFromStrapi("/quiz-topics?populate=quiz_subtopics");
}

export async function getQuizSubtopics(topicId: string): Promise<QuizSubtopicsResponse> {
  // Filters by topic and populates questions
  return fetchFromStrapi(
    `/quiz-subtopics?filters[quiz_topic][id]=${topicId}&populate=quiz_questions`
  );
}

export async function getQuizQuestions(
  subtopicId: string,
  difficulty?: string
): Promise<QuizQuestionsResponse> {
  let endpoint = `/quiz-questions?filters[quiz_subtopic][id]=${subtopicId}`;
  if (difficulty) endpoint += `&filters[difficulty]=${difficulty}`;
  return fetchFromStrapi(endpoint);
}
