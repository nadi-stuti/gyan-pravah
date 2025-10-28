import axios, { AxiosInstance, AxiosError } from 'axios'
import { 
  QuizQuestion, 
  QuizTopic, 
  QuizSubtopic,
  QuizTopicsResponse,
  QuizSubtopicsResponse,
  QuizQuestionsResponse,
  StrapiError,
  StrapiErrorResponse
} from '@gyan-pravah/types'

// Query parameter interfaces
export interface QuestionFilters {
  topic?: string
  subtopic?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  limit?: number
}

export interface TopicFilters {
  populate?: string[]
}

export interface SubtopicFilters {
  topic?: string
  populate?: string[]
}

// Strapi client configuration
class StrapiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for authentication if needed
    this.client.interceptors.request.use(
      (config) => {
        const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<StrapiErrorResponse>) => {
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError<StrapiErrorResponse>): StrapiError {
    if (error.response?.data?.error) {
      return error.response.data.error
    }

    if (error.code === 'ECONNABORTED') {
      return {
        status: 408,
        name: 'TimeoutError',
        message: 'Request timeout - please check your connection',
      }
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        status: 0,
        name: 'NetworkError',
        message: 'Network error - please check your internet connection',
      }
    }

    return {
      status: error.response?.status || 500,
      name: 'UnknownError',
      message: error.message || 'An unexpected error occurred',
    }
  }

  // Fetch questions with filters
  async getQuestions(filters: QuestionFilters = {}): Promise<QuizQuestion[]> {
    const params = new URLSearchParams()
    
    if (filters.topic) {
      params.append('filters[quiz_topic][slug][$eq]', filters.topic)
    }
    
    if (filters.subtopic) {
      params.append('filters[quiz_subtopic][slug][$eq]', filters.subtopic)
    }
    
    if (filters.difficulty) {
      params.append('filters[difficulty][$eq]', filters.difficulty)
    }
    
    if (filters.limit) {
      params.append('pagination[limit]', filters.limit.toString())
    }

    // Always populate related data
    params.append('populate[quiz_topic][fields][0]', 'topicName')
    params.append('populate[quiz_topic][fields][1]', 'slug')
    params.append('populate[quiz_subtopic][fields][0]', 'name')
    params.append('populate[quiz_subtopic][fields][1]', 'slug')

    const response = await this.client.get<QuizQuestionsResponse>(
      `/api/quiz-questions?${params.toString()}`
    )
    
    return response.data.data
  }

  // Fetch topics with subtopics
  async getTopics(filters: TopicFilters = {}): Promise<QuizTopic[]> {
    const params = new URLSearchParams()
    
    // Populate subtopics by default
    params.append('populate[quiz_subtopics][fields][0]', 'name')
    params.append('populate[quiz_subtopics][fields][1]', 'slug')

    const response = await this.client.get<QuizTopicsResponse>(
      `/api/quiz-topics?${params.toString()}`
    )
    
    return response.data.data
  }

  // Fetch subtopics with optional topic filter
  async getSubtopics(filters: SubtopicFilters = {}): Promise<QuizSubtopic[]> {
    const params = new URLSearchParams()
    
    if (filters.topic) {
      params.append('filters[quiz_topic][slug][$eq]', filters.topic)
    }

    // Populate topic data
    params.append('populate[quiz_topic][fields][0]', 'topicName')
    params.append('populate[quiz_topic][fields][1]', 'slug')

    const response = await this.client.get<QuizSubtopicsResponse>(
      `/api/quiz-subtopics?${params.toString()}`
    )
    
    return response.data.data
  }

  // Get subtopic availability (which subtopics have questions) - More efficient approach
  async getSubtopicAvailability(): Promise<Record<string, { questionCount: number; hasQuestions: boolean }>> {
    try {
      // First, get all subtopics
      const subtopics = await this.getAllSubtopics()
      console.log('Found subtopics:', subtopics.map(s => ({ slug: s.slug, name: s.name }))) // Debug log
      
      const availability: Record<string, { questionCount: number; hasQuestions: boolean }> = {}
      
      // For each subtopic, get the count of questions
      for (const subtopic of subtopics) {
        try {
          const params = new URLSearchParams()
          params.append('filters[quiz_subtopic][slug][$eq]', subtopic.slug)
          params.append('pagination[limit]', '1') // We only need the count, not the data
          
          const url = `/api/quiz-questions?${params.toString()}`
          console.log(`Fetching questions for ${subtopic.slug}:`, url) // Debug log
          
          const response = await this.client.get<QuizQuestionsResponse>(url)
          
          const questionCount = response.data.meta?.pagination?.total || 0
          console.log(`${subtopic.slug}: ${questionCount} questions`) // Debug log
          
          availability[subtopic.slug] = {
            questionCount,
            hasQuestions: questionCount > 0
          }
        } catch (error) {
          console.error(`Failed to get question count for subtopic ${subtopic.slug}:`, error)
          availability[subtopic.slug] = {
            questionCount: 0,
            hasQuestions: false
          }
        }
      }
      
      console.log('Final subtopic availability:', availability) // Debug log
      return availability
    } catch (error) {
      console.error('Failed to get subtopic availability:', error)
      return {}
    }
  }

  // Helper method to get all subtopics with proper pagination
  private async getAllSubtopics(): Promise<QuizSubtopic[]> {
    const allSubtopics: QuizSubtopic[] = []
    let page = 1
    let hasMore = true
    const pageSize = 100
    
    while (hasMore) {
      try {
        const params = new URLSearchParams()
        params.append('pagination[page]', page.toString())
        params.append('pagination[pageSize]', pageSize.toString())
        
        const response = await this.client.get<QuizSubtopicsResponse>(
          `/api/quiz-subtopics?${params.toString()}`
        )
        
        const { data, meta } = response.data
        allSubtopics.push(...data)
        
        // Check if there are more pages
        const pagination = meta?.pagination
        if (pagination) {
          hasMore = page < pagination.pageCount
          page++
        } else {
          hasMore = false
        }
        
        // Safety break to avoid infinite loops
        if (page > 50) {
          console.warn('Reached maximum page limit while fetching subtopics')
          break
        }
        
      } catch (error) {
        console.error(`Failed to fetch subtopics page ${page}:`, error)
        break
      }
    }
    
    console.log(`Fetched ${allSubtopics.length} total subtopics across ${page - 1} pages`) // Debug log
    return allSubtopics
  }

  // Get random questions for "Play Now" functionality with better distribution
  async getRandomQuestions(count: number = 5, mode: 'normal' | 'expert' | 'first-visit' = 'normal'): Promise<QuizQuestion[]> {
    try {
      // First, get all available subtopics with questions
      const availability = await this.getSubtopicAvailability()
      const availableSubtopics = Object.keys(availability).filter(slug => availability[slug].hasQuestions)
      
      if (availableSubtopics.length === 0) {
        throw new Error('No subtopics with questions available')
      }

      // Get questions from multiple subtopics for better variety
      const questionsPerSubtopic = Math.max(1, Math.ceil(count / Math.min(availableSubtopics.length, 3)))
      const selectedQuestions: QuizQuestion[] = []
      
      // Shuffle subtopics to ensure random selection
      const shuffledSubtopics = this.shuffleArray(availableSubtopics)
      
      for (const subtopicSlug of shuffledSubtopics) {
        if (selectedQuestions.length >= count) break
        
        const params = new URLSearchParams()
        params.append('filters[quiz_subtopic][slug][$eq]', subtopicSlug)
        
        // Set difficulty based on mode
        if (mode === 'first-visit') {
          params.append('filters[difficulty][$eq]', 'Easy')
        } else if (mode === 'expert') {
          params.append('filters[difficulty][$in][0]', 'Medium')
          params.append('filters[difficulty][$in][1]', 'Hard')
        } else {
          // Normal mode: mostly easy with some medium
          params.append('filters[difficulty][$in][0]', 'Easy')
          params.append('filters[difficulty][$in][1]', 'Medium')
        }

        params.append('pagination[limit]', (questionsPerSubtopic * 2).toString())
        
        // Populate related data
        params.append('populate[quiz_topic][fields][0]', 'topicName')
        params.append('populate[quiz_topic][fields][1]', 'slug')
        params.append('populate[quiz_subtopic][fields][0]', 'name')
        params.append('populate[quiz_subtopic][fields][1]', 'slug')

        const response = await this.client.get<QuizQuestionsResponse>(
          `/api/quiz-questions?${params.toString()}`
        )
        
        // Add shuffled questions from this subtopic
        const subtopicQuestions = this.shuffleArray(response.data.data)
        const questionsToAdd = subtopicQuestions.slice(0, Math.min(questionsPerSubtopic, count - selectedQuestions.length))
        selectedQuestions.push(...questionsToAdd)
      }
      
      // Final shuffle to mix questions from different subtopics
      return this.shuffleArray(selectedQuestions).slice(0, count)
      
    } catch (error) {
      console.error('Failed to get random questions:', error)
      // Fallback to original method
      return this.getRandomQuestionsFallback(count, mode)
    }
  }

  // Fallback method for random questions (original implementation)
  private async getRandomQuestionsFallback(count: number = 5, mode: 'normal' | 'expert' | 'first-visit' = 'normal'): Promise<QuizQuestion[]> {
    const params = new URLSearchParams()
    
    // Set difficulty based on mode
    if (mode === 'first-visit') {
      params.append('filters[difficulty][$eq]', 'Easy')
    } else if (mode === 'expert') {
      params.append('filters[difficulty][$in][0]', 'Medium')
      params.append('filters[difficulty][$in][1]', 'Hard')
    } else {
      // Normal mode: mostly easy with some medium
      params.append('filters[difficulty][$in][0]', 'Easy')
      params.append('filters[difficulty][$in][1]', 'Medium')
    }

    params.append('pagination[limit]', (count * 3).toString()) // Get more for better randomization
    
    // Populate related data
    params.append('populate[quiz_topic][fields][0]', 'topicName')
    params.append('populate[quiz_topic][fields][1]', 'slug')
    params.append('populate[quiz_subtopic][fields][0]', 'name')
    params.append('populate[quiz_subtopic][fields][1]', 'slug')

    const response = await this.client.get<QuizQuestionsResponse>(
      `/api/quiz-questions?${params.toString()}`
    )
    
    // Shuffle the results to ensure randomness
    const questions = response.data.data
    return this.shuffleArray(questions).slice(0, count)
  }

  // Utility method to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Debug method to test subtopic fetching
  async debugAllSubtopics(): Promise<void> {
    try {
      console.log('=== DEBUG: Testing subtopic fetching ===')
      
      // Test the getAllSubtopics method
      const allSubtopics = await this.getAllSubtopics()
      console.log(`Total subtopics found: ${allSubtopics.length}`)
      
      // Group by topic for easier analysis
      const subtopicsByTopic: Record<string, string[]> = {}
      allSubtopics.forEach(subtopic => {
        const topicSlug = subtopic.quiz_topic?.slug || 'unknown'
        if (!subtopicsByTopic[topicSlug]) {
          subtopicsByTopic[topicSlug] = []
        }
        subtopicsByTopic[topicSlug].push(subtopic.slug)
      })
      
      console.log('Subtopics by topic:', subtopicsByTopic)
      
      // Check specifically for Dham and Sant
      const dhamSubtopics = allSubtopics.filter(s => s.quiz_topic?.slug === 'dham')
      const santSubtopics = allSubtopics.filter(s => s.quiz_topic?.slug === 'sant')
      
      console.log('Dham subtopics:', dhamSubtopics.map(s => ({ slug: s.slug, name: s.name })))
      console.log('Sant subtopics:', santSubtopics.map(s => ({ slug: s.slug, name: s.name })))
      
    } catch (error) {
      console.error('Debug all subtopics failed:', error)
    }
  }

  // Debug method to test specific subtopic
  async debugSubtopic(subtopicSlug: string): Promise<void> {
    try {
      console.log(`=== DEBUG: Testing subtopic ${subtopicSlug} ===`)
      
      // Test 1: Get questions with no filters
      const allQuestionsResponse = await this.client.get<QuizQuestionsResponse>('/api/quiz-questions?pagination[limit]=5')
      console.log('Sample questions (no filter):', allQuestionsResponse.data.data.map(q => ({
        id: q.id,
        question: q.question.substring(0, 50) + '...',
        subtopic: q.quiz_subtopic?.slug,
        topic: q.quiz_topic?.slug
      })))
      
      // Test 2: Get questions for specific subtopic
      const params = new URLSearchParams()
      params.append('filters[quiz_subtopic][slug][$eq]', subtopicSlug)
      params.append('populate[quiz_subtopic][fields][0]', 'slug')
      params.append('populate[quiz_subtopic][fields][1]', 'name')
      params.append('populate[quiz_topic][fields][0]', 'slug')
      params.append('populate[quiz_topic][fields][1]', 'topicName')
      
      const subtopicQuestionsResponse = await this.client.get<QuizQuestionsResponse>(
        `/api/quiz-questions?${params.toString()}`
      )
      
      console.log(`Questions for ${subtopicSlug}:`, {
        total: subtopicQuestionsResponse.data.meta?.pagination?.total,
        returned: subtopicQuestionsResponse.data.data.length,
        questions: subtopicQuestionsResponse.data.data.map(q => ({
          id: q.id,
          question: q.question.substring(0, 50) + '...',
          subtopic: q.quiz_subtopic?.slug,
          topic: q.quiz_topic?.slug
        }))
      })
      
    } catch (error) {
      console.error(`Debug failed for ${subtopicSlug}:`, error)
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/api/quiz-questions?pagination[limit]=1')
      return true
    } catch (error) {
      console.error('Strapi health check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const strapiClient = new StrapiClient()