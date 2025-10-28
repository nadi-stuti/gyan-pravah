import { strapiClient, QuestionFilters, TopicFilters, SubtopicFilters } from './strapi'
import { 
  QuizQuestion, 
  QuizTopic, 
  QuizSubtopic,
  StrapiError
} from '@gyan-pravah/types'

// Main API functions - online only
export class QuizAPI {
  // Fetch questions with filters
  static async getQuestions(filters: QuestionFilters = {}): Promise<QuizQuestion[]> {
    try {
      return await strapiClient.getQuestions(filters)
    } catch (error) {
      console.error('Failed to fetch questions from Strapi:', error)
      throw error
    }
  }

  // Fetch topics with subtopics
  static async getTopics(filters: TopicFilters = {}): Promise<QuizTopic[]> {
    try {
      return await strapiClient.getTopics(filters)
    } catch (error) {
      console.error('Failed to fetch topics from Strapi:', error)
      throw error
    }
  }

  // Fetch subtopics with optional topic filter
  static async getSubtopics(filters: SubtopicFilters = {}): Promise<QuizSubtopic[]> {
    try {
      return await strapiClient.getSubtopics(filters)
    } catch (error) {
      console.error('Failed to fetch subtopics from Strapi:', error)
      throw error
    }
  }

  // Get random questions for "Play Now" functionality
  static async getRandomQuestions(
    count: number = 5, 
    mode: 'normal' | 'expert' | 'first-visit' = 'normal'
  ): Promise<QuizQuestion[]> {
    try {
      return await strapiClient.getRandomQuestions(count, mode)
    } catch (error) {
      console.error('Failed to fetch random questions from Strapi:', error)
      throw error
    }
  }

  // Get questions by topic and difficulty (for quiz setup)
  static async getQuizQuestions(
    topicSlug?: string,
    subtopicSlug?: string,
    difficulty?: 'Easy' | 'Medium' | 'Hard',
    count: number = 5
  ): Promise<QuizQuestion[]> {
    const filters: QuestionFilters = {
      limit: count * 2, // Get more questions to allow for randomization
    }
    
    if (topicSlug) {
      filters.topic = topicSlug
    }
    
    if (subtopicSlug) {
      filters.subtopic = subtopicSlug
    }
    
    if (difficulty) {
      filters.difficulty = difficulty
    }
    
    const questions = await this.getQuestions(filters)
    
    // Shuffle and return requested count
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // Check if Strapi is available
  static async checkConnection(): Promise<boolean> {
    try {
      return await strapiClient.healthCheck()
    } catch (error) {
      console.error('Strapi connection check failed:', error)
      return false
    }
  }
}

// Export convenience functions
export const getQuestions = QuizAPI.getQuestions.bind(QuizAPI)
export const getTopics = QuizAPI.getTopics.bind(QuizAPI)
export const getSubtopics = QuizAPI.getSubtopics.bind(QuizAPI)
export const getRandomQuestions = QuizAPI.getRandomQuestions.bind(QuizAPI)
export const getQuizQuestions = QuizAPI.getQuizQuestions.bind(QuizAPI)
export const checkConnection = QuizAPI.checkConnection.bind(QuizAPI)

// Export error types for error handling
export type { StrapiError } from '@gyan-pravah/types'