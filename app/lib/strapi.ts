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

  // Fetch topics with subtopics - With proper pagination
  async getTopics(filters: TopicFilters = {}): Promise<QuizTopic[]> {
    const allTopics: QuizTopic[] = []
    let page = 1
    let hasMore = true
    const pageSize = 25 // All 9 topics should fit in one page, but being safe

    while (hasMore) {
      try {
        const params = new URLSearchParams()

        // Pagination
        params.append('pagination[page]', page.toString())
        params.append('pagination[pageSize]', pageSize.toString())

        // Populate subtopics with availability info
        params.append('populate[quiz_subtopics][fields][0]', 'name')
        params.append('populate[quiz_subtopics][fields][1]', 'slug')
        params.append('populate[quiz_subtopics][fields][2]', 'available')
        params.append('populate[quiz_subtopics][fields][3]', 'questionCount')

        const response = await this.client.get<QuizTopicsResponse>(
          `/api/quiz-topics?${params.toString()}`
        )

        const { data, meta } = response.data
        allTopics.push(...data)

        // Check if there are more pages
        const pagination = meta?.pagination
        if (pagination) {
          hasMore = page < pagination.pageCount
          page++
        } else {
          hasMore = false
        }

        // Safety break
        if (page > 5) {
          console.warn('Reached maximum page limit while fetching topics')
          break
        }

      } catch (error) {
        console.error(`Failed to fetch topics page ${page}:`, error)
        break
      }
    }

    console.log(`Fetched ${allTopics.length} topics across ${page - 1} pages`)
    return allTopics
  }

  // Fetch subtopics with optional topic filter - Optimized with available field
  async getSubtopics(filters: SubtopicFilters = {}): Promise<QuizSubtopic[]> {
    const params = new URLSearchParams()

    if (filters.topic) {
      params.append('filters[quiz_topic][slug][$eq]', filters.topic)
    }

    // Include essential fields
    params.append('fields[0]', 'slug')
    params.append('fields[1]', 'name')
    params.append('fields[2]', 'available')
    params.append('fields[3]', 'questionCount')

    // Populate topic data
    params.append('populate[quiz_topic][fields][0]', 'topicName')
    params.append('populate[quiz_topic][fields][1]', 'slug')

    const response = await this.client.get<QuizSubtopicsResponse>(
      `/api/quiz-subtopics?${params.toString()}`
    )

    return response.data.data
  }

  // Get only available subtopics for a specific topic
  async getAvailableSubtopicsForTopic(topicSlug: string): Promise<QuizSubtopic[]> {
    const params = new URLSearchParams()

    params.append('filters[quiz_topic][slug][$eq]', topicSlug)
    params.append('filters[available][$eq]', 'true')

    // Include essential fields
    params.append('fields[0]', 'slug')
    params.append('fields[1]', 'name')
    params.append('fields[2]', 'available')
    params.append('fields[3]', 'questionCount')

    // Populate topic data
    params.append('populate[quiz_topic][fields][0]', 'topicName')
    params.append('populate[quiz_topic][fields][1]', 'slug')

    const response = await this.client.get<QuizSubtopicsResponse>(
      `/api/quiz-subtopics?${params.toString()}`
    )

    return response.data.data
  }

  // Get topics with availability status (has available subtopics or not)
  async getTopicsWithAvailability(): Promise<Array<QuizTopic & { hasAvailableSubtopics: boolean; availableSubtopicCount: number }>> {
    try {
      const topics = await this.getTopics()
      const topicsWithAvailability = topics.map(topic => {
        const availableSubtopics = topic.quiz_subtopics?.filter(subtopic => subtopic.available) || []
        return {
          ...topic,
          hasAvailableSubtopics: availableSubtopics.length > 0,
          availableSubtopicCount: availableSubtopics.length
        }
      })

      console.log('Topics with availability:', topicsWithAvailability.map(t => ({
        slug: t.slug,
        name: t.topicName,
        hasAvailable: t.hasAvailableSubtopics,
        count: t.availableSubtopicCount
      })))

      return topicsWithAvailability
    } catch (error) {
      console.error('Failed to get topics with availability:', error)
      throw error
    }
  }

  // Get subtopic availability using the new schema fields - With proper pagination
  async getSubtopicAvailability(): Promise<Record<string, { questionCount: number; hasQuestions: boolean }>> {
    try {
      const allSubtopics: QuizSubtopic[] = []
      let page = 1
      let hasMore = true
      const pageSize = 100

      while (hasMore) {
        const params = new URLSearchParams()

        // Pagination
        params.append('pagination[page]', page.toString())
        params.append('pagination[pageSize]', pageSize.toString())

        // Only fetch essential fields
        params.append('fields[0]', 'slug')
        params.append('fields[1]', 'name')
        params.append('fields[2]', 'available')
        params.append('fields[3]', 'questionCount')

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

        // Safety break
        if (page > 20) break
      }

      const availability: Record<string, { questionCount: number; hasQuestions: boolean }> = {}

      allSubtopics.forEach(subtopic => {
        availability[subtopic.slug] = {
          questionCount: subtopic.questionCount || 0,
          hasQuestions: subtopic.available || false
        }
      })

      return availability
    } catch (error) {
      console.error('Failed to get subtopic availability:', error)
      return {}
    }
  }

  // Get available subtopics only - Single efficient call with proper pagination
  async getAvailableSubtopics(): Promise<QuizSubtopic[]> {
    const allSubtopics: QuizSubtopic[] = []
    let page = 1
    let hasMore = true
    const pageSize = 100 // Increase page size for efficiency

    while (hasMore) {
      try {
        const params = new URLSearchParams()

        // Filter for available subtopics only
        params.append('filters[available][$eq]', 'true')

        // Pagination
        params.append('pagination[page]', page.toString())
        params.append('pagination[pageSize]', pageSize.toString())

        // Only fetch essential fields
        params.append('fields[0]', 'slug')
        params.append('fields[1]', 'name')
        params.append('fields[2]', 'available')
        params.append('fields[3]', 'questionCount')

        // Populate topic data
        params.append('populate[quiz_topic][fields][0]', 'topicName')
        params.append('populate[quiz_topic][fields][1]', 'slug')

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
        if (page > 20) {
          console.warn('Reached maximum page limit while fetching available subtopics')
          break
        }

      } catch (error) {
        console.error(`Failed to fetch available subtopics page ${page}:`, error)
        break
      }
    }

    console.log(`Fetched ${allSubtopics.length} available subtopics across ${page - 1} pages`)
    return allSubtopics
  }

  // Get random questions with proper distribution across topics/subtopics
  async getRandomQuestions(count: number = 5, mode: 'normal' | 'expert' | 'first-visit' = 'normal'): Promise<QuizQuestion[]> {
    try {
      console.log(`Getting ${count} random questions for mode: ${mode}`)

      // First, get all available subtopics to ensure proper distribution
      const availableSubtopics = await this.getAvailableSubtopics()

      if (availableSubtopics.length === 0) {
        throw new Error('No available subtopics found')
      }

      console.log(`Found ${availableSubtopics.length} available subtopics`)

      // Group subtopics by topic for better distribution
      const subtopicsByTopic: Record<string, QuizSubtopic[]> = {}
      availableSubtopics.forEach(subtopic => {
        const topicSlug = subtopic.quiz_topic?.slug || 'unknown'
        if (!subtopicsByTopic[topicSlug]) {
          subtopicsByTopic[topicSlug] = []
        }
        subtopicsByTopic[topicSlug].push(subtopic)
      })

      const topicSlugs = Object.keys(subtopicsByTopic)
      console.log(`Available topics: ${topicSlugs.join(', ')}`)

      // Calculate how many questions to get from each topic for better distribution
      const questionsPerTopic = Math.max(1, Math.ceil(count / topicSlugs.length))
      const selectedQuestions: QuizQuestion[] = []

      // Shuffle topics to ensure random selection
      const shuffledTopics = this.shuffleArray(topicSlugs)

      for (const topicSlug of shuffledTopics) {
        if (selectedQuestions.length >= count) break

        const topicSubtopics = subtopicsByTopic[topicSlug]

        // Select random subtopics from this topic
        const shuffledSubtopics = this.shuffleArray(topicSubtopics)
        const subtopicsToUse = shuffledSubtopics.slice(0, Math.min(3, shuffledSubtopics.length)) // Use up to 3 subtopics per topic

        for (const subtopic of subtopicsToUse) {
          if (selectedQuestions.length >= count) break

          const questionsNeeded = Math.min(
            questionsPerTopic,
            count - selectedQuestions.length,
            Math.ceil(questionsPerTopic / subtopicsToUse.length)
          )

          try {
            const params = new URLSearchParams()

            // Filter by this specific subtopic
            params.append('filters[quiz_subtopic][slug][$eq]', subtopic.slug)

            // Set difficulty based on mode
            if (mode === 'first-visit') {
              params.append('filters[difficulty][$eq]', 'Easy')
            } else if (mode === 'expert') {
              params.append('filters[difficulty][$in][0]', 'Medium')
              params.append('filters[difficulty][$in][1]', 'Hard')
            } else {
              // Normal mode: easy and medium
              params.append('filters[difficulty][$in][0]', 'Easy')
              params.append('filters[difficulty][$in][1]', 'Medium')
            }

            // Get more questions for randomization
            params.append('pagination[limit]', (questionsNeeded * 2).toString())

            // Populate related data
            params.append('populate[quiz_topic][fields][0]', 'topicName')
            params.append('populate[quiz_topic][fields][1]', 'slug')
            params.append('populate[quiz_subtopic][fields][0]', 'name')
            params.append('populate[quiz_subtopic][fields][1]', 'slug')

            const response = await this.client.get<QuizQuestionsResponse>(
              `/api/quiz-questions?${params.toString()}`
            )

            const subtopicQuestions = this.shuffleArray(response.data.data)
            const questionsToAdd = subtopicQuestions.slice(0, questionsNeeded)

            console.log(`Added ${questionsToAdd.length} questions from ${subtopic.name} (${topicSlug})`)
            selectedQuestions.push(...questionsToAdd)

          } catch (error) {
            console.error(`Failed to get questions from subtopic ${subtopic.slug}:`, error)
            // Continue with other subtopics
          }
        }
      }

      // If we don't have enough questions, try to get more from any available subtopic
      if (selectedQuestions.length < count) {
        console.log(`Only got ${selectedQuestions.length}/${count} questions, trying to get more...`)

        const params = new URLSearchParams()
        params.append('filters[quiz_subtopic][available][$eq]', 'true')

        if (mode === 'first-visit') {
          params.append('filters[difficulty][$eq]', 'Easy')
        } else if (mode === 'expert') {
          params.append('filters[difficulty][$in][0]', 'Medium')
          params.append('filters[difficulty][$in][1]', 'Hard')
        } else {
          params.append('filters[difficulty][$in][0]', 'Easy')
          params.append('filters[difficulty][$in][1]', 'Medium')
        }

        params.append('pagination[limit]', ((count - selectedQuestions.length) * 2).toString())

        params.append('populate[quiz_topic][fields][0]', 'topicName')
        params.append('populate[quiz_topic][fields][1]', 'slug')
        params.append('populate[quiz_subtopic][fields][0]', 'name')
        params.append('populate[quiz_subtopic][fields][1]', 'slug')

        const response = await this.client.get<QuizQuestionsResponse>(
          `/api/quiz-questions?${params.toString()}`
        )

        // Filter out questions we already have
        const existingQuestionIds = new Set(selectedQuestions.map(q => q.id))
        const additionalQuestions = response.data.data.filter(q => !existingQuestionIds.has(q.id))

        const shuffledAdditional = this.shuffleArray(additionalQuestions)
        const questionsToAdd = shuffledAdditional.slice(0, count - selectedQuestions.length)

        selectedQuestions.push(...questionsToAdd)
      }

      // Final shuffle to mix questions from different topics/subtopics
      const finalQuestions = this.shuffleArray(selectedQuestions).slice(0, count)

      console.log(`Final selection: ${finalQuestions.length} questions from topics:`,
        [...new Set(finalQuestions.map(q => q.quiz_topic?.slug))].join(', '))

      return finalQuestions

    } catch (error) {
      console.error('Failed to get random questions:', error)
      throw error
    }
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

  // Debug method to test the entire system
  async debugSystem(): Promise<void> {
    try {
      console.log('=== DEBUG: System Analysis ===')

      // Test topics
      const topics = await this.getTopics()
      console.log(`Total topics found: ${topics.length}`)

      // Test available subtopics
      const availableSubtopics = await this.getAvailableSubtopics()
      console.log(`Available subtopics found: ${availableSubtopics.length}`)

      // Group by topic for analysis
      const subtopicsByTopic: Record<string, Array<{ slug: string; name: string; questionCount: number }>> = {}
      availableSubtopics.forEach(subtopic => {
        const topicSlug = subtopic.quiz_topic?.slug || 'unknown'
        if (!subtopicsByTopic[topicSlug]) {
          subtopicsByTopic[topicSlug] = []
        }
        subtopicsByTopic[topicSlug].push({
          slug: subtopic.slug,
          name: subtopic.name,
          questionCount: subtopic.questionCount || 0
        })
      })

      console.log('Available subtopics by topic:', subtopicsByTopic)

      // Test topics with availability
      const topicsWithAvailability = await this.getTopicsWithAvailability()
      console.log('Topics availability summary:')
      topicsWithAvailability.forEach(topic => {
        console.log(`- ${topic.topicName} (${topic.slug}): ${topic.hasAvailableSubtopics ? 'AVAILABLE' : 'COMING SOON'} (${topic.availableSubtopicCount} subtopics)`)
      })

      // Test random questions
      console.log('\n=== Testing Random Questions ===')
      const easyQuestions = await this.getRandomQuestions(5, 'first-visit')
      console.log(`Easy questions (${easyQuestions.length}):`, easyQuestions.map(q => `${q.quiz_topic?.slug}/${q.quiz_subtopic?.slug}`))

      const normalQuestions = await this.getRandomQuestions(5, 'normal')
      console.log(`Normal questions (${normalQuestions.length}):`, normalQuestions.map(q => `${q.quiz_topic?.slug}/${q.quiz_subtopic?.slug}`))

      const expertQuestions = await this.getRandomQuestions(5, 'expert')
      console.log(`Expert questions (${expertQuestions.length}):`, expertQuestions.map(q => `${q.quiz_topic?.slug}/${q.quiz_subtopic?.slug}`))

    } catch (error) {
      console.error('Debug system failed:', error)
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