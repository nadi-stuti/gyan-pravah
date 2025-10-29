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

  // Get only available subtopics (optimized)
  static async getAvailableSubtopics(): Promise<QuizSubtopic[]> {
    try {
      return await strapiClient.getAvailableSubtopics()
    } catch (error) {
      console.error('Failed to fetch available subtopics from Strapi:', error)
      throw error
    }
  }

  // Get available subtopics for a specific topic (optimized)
  static async getAvailableSubtopicsForTopic(topicSlug: string): Promise<QuizSubtopic[]> {
    try {
      return await strapiClient.getAvailableSubtopicsForTopic(topicSlug)
    } catch (error) {
      console.error('Failed to fetch available subtopics for topic from Strapi:', error)
      throw error
    }
  }

  // Get subtopic availability map (optimized single call)
  static async getSubtopicAvailability(): Promise<Record<string, { questionCount: number; hasQuestions: boolean }>> {
    try {
      return await strapiClient.getSubtopicAvailability()
    } catch (error) {
      console.error('Failed to fetch subtopic availability from Strapi:', error)
      throw error
    }
  }

  // Get topics with availability status
  static async getTopicsWithAvailability(): Promise<Array<QuizTopic & { hasAvailableSubtopics: boolean; availableSubtopicCount: number }>> {
    try {
      return await strapiClient.getTopicsWithAvailability()
    } catch (error) {
      console.error('Failed to fetch topics with availability from Strapi:', error)
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
export const getAvailableSubtopics = QuizAPI.getAvailableSubtopics.bind(QuizAPI)
export const getAvailableSubtopicsForTopic = QuizAPI.getAvailableSubtopicsForTopic.bind(QuizAPI)
export const getSubtopicAvailability = QuizAPI.getSubtopicAvailability.bind(QuizAPI)
export const getTopicsWithAvailability = QuizAPI.getTopicsWithAvailability.bind(QuizAPI)
export const getRandomQuestions = QuizAPI.getRandomQuestions.bind(QuizAPI)
export const getQuizQuestions = QuizAPI.getQuizQuestions.bind(QuizAPI)
export const checkConnection = QuizAPI.checkConnection.bind(QuizAPI)

// Export error types for error handling
export type { StrapiError } from '@gyan-pravah/types'