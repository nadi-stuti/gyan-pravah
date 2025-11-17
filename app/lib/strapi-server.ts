import {
  QuizQuestion,
  QuizTopic,
  QuizSubtopic,
  QuizTopicsResponse,
  QuizSubtopicsResponse,
  QuizQuestionsResponse,
} from '@gyan-pravah/types'

// Server-side Strapi client using Next.js fetch with caching
// This file should only be imported in Server Components or Server Actions

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

// Revalidation times (in seconds)
const REVALIDATE_TOPICS = 3600 // 1 hour - topics change rarely
const REVALIDATE_SUBTOPICS = 1800 // 30 minutes - subtopics change occasionally
const REVALIDATE_QUESTIONS = 300 // 5 minutes - questions may be updated more frequently

/**
 * Build Strapi query parameters for filtering and population
 */
function buildStrapiParams(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value))
  })
  
  return searchParams.toString()
}

/**
 * Fetch data from Strapi with proper error handling
 */
async function fetchFromStrapi<T>(
  endpoint: string,
  options: {
    revalidate?: number | false
    tags?: string[]
  } = {}
): Promise<T> {
  const url = `${STRAPI_URL}${endpoint}`
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`
  }
  
  try {
    const response = await fetch(url, {
      headers,
      next: {
        revalidate: options.revalidate,
        tags: options.tags,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch from Strapi: ${endpoint}`, error)
    throw error
  }
}

/**
 * Fetch all topics with their subtopics
 * Cached for 1 hour
 */
export async function getTopics(): Promise<QuizTopic[]> {
  const allTopics: QuizTopic[] = []
  let page = 1
  let hasMore = true
  const pageSize = 25
  
  while (hasMore) {
    const params = buildStrapiParams({
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'populate[quiz_subtopics][fields][0]': 'name',
      'populate[quiz_subtopics][fields][1]': 'slug',
      'populate[quiz_subtopics][fields][2]': 'available',
      'populate[quiz_subtopics][fields][3]': 'questionCount',
    })
    
    const response = await fetchFromStrapi<QuizTopicsResponse>(
      `/api/quiz-topics?${params}`,
      { revalidate: REVALIDATE_TOPICS, tags: ['topics'] }
    )
    
    allTopics.push(...response.data)
    
    const pagination = response.meta?.pagination
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
  }
  
  return allTopics
}

/**
 * Fetch topics with availability information
 * Cached for 1 hour
 */
export async function getTopicsWithAvailability(): Promise<
  Array<QuizTopic & { hasAvailableSubtopics: boolean; availableSubtopicCount: number }>
> {
  const topics = await getTopics()
  
  return topics.map(topic => {
    const availableSubtopics = topic.quiz_subtopics?.filter(subtopic => subtopic.available) || []
    return {
      ...topic,
      hasAvailableSubtopics: availableSubtopics.length > 0,
      availableSubtopicCount: availableSubtopics.length,
    }
  })
}

/**
 * Fetch subtopics with optional topic filter
 * Cached for 30 minutes
 */
export async function getSubtopics(topicSlug?: string): Promise<QuizSubtopic[]> {
  const params: Record<string, string | number> = {
    'fields[0]': 'slug',
    'fields[1]': 'name',
    'fields[2]': 'available',
    'fields[3]': 'questionCount',
    'populate[quiz_topic][fields][0]': 'topicName',
    'populate[quiz_topic][fields][1]': 'slug',
  }
  
  if (topicSlug) {
    params['filters[quiz_topic][slug][$eq]'] = topicSlug
  }
  
  const queryString = buildStrapiParams(params)
  
  const response = await fetchFromStrapi<QuizSubtopicsResponse>(
    `/api/quiz-subtopics?${queryString}`,
    { revalidate: REVALIDATE_SUBTOPICS, tags: ['subtopics', topicSlug].filter(Boolean) as string[] }
  )
  
  return response.data
}

/**
 * Fetch only available subtopics
 * Cached for 30 minutes
 */
export async function getAvailableSubtopics(): Promise<QuizSubtopic[]> {
  const allSubtopics: QuizSubtopic[] = []
  let page = 1
  let hasMore = true
  const pageSize = 100
  
  while (hasMore) {
    const params = buildStrapiParams({
      'filters[available][$eq]': 'true',
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'fields[0]': 'slug',
      'fields[1]': 'name',
      'fields[2]': 'available',
      'fields[3]': 'questionCount',
      'populate[quiz_topic][fields][0]': 'topicName',
      'populate[quiz_topic][fields][1]': 'slug',
    })
    
    const response = await fetchFromStrapi<QuizSubtopicsResponse>(
      `/api/quiz-subtopics?${params}`,
      { revalidate: REVALIDATE_SUBTOPICS, tags: ['subtopics', 'available'] }
    )
    
    allSubtopics.push(...response.data)
    
    const pagination = response.meta?.pagination
    if (pagination) {
      hasMore = page < pagination.pageCount
      page++
    } else {
      hasMore = false
    }
    
    // Safety break
    if (page > 20) {
      console.warn('Reached maximum page limit while fetching available subtopics')
      break
    }
  }
  
  return allSubtopics
}

/**
 * Fetch available subtopics for a specific topic
 * Cached for 30 minutes
 */
export async function getAvailableSubtopicsForTopic(topicSlug: string): Promise<QuizSubtopic[]> {
  const params = buildStrapiParams({
    'filters[quiz_topic][slug][$eq]': topicSlug,
    'filters[available][$eq]': 'true',
    'fields[0]': 'slug',
    'fields[1]': 'name',
    'fields[2]': 'available',
    'fields[3]': 'questionCount',
    'populate[quiz_topic][fields][0]': 'topicName',
    'populate[quiz_topic][fields][1]': 'slug',
  })
  
  const response = await fetchFromStrapi<QuizSubtopicsResponse>(
    `/api/quiz-subtopics?${params}`,
    { revalidate: REVALIDATE_SUBTOPICS, tags: ['subtopics', topicSlug, 'available'] }
  )
  
  return response.data
}

/**
 * Fetch subtopic availability map
 * Cached for 30 minutes
 */
export async function getSubtopicAvailability(): Promise<
  Record<string, { questionCount: number; hasQuestions: boolean }>
> {
  const allSubtopics: QuizSubtopic[] = []
  let page = 1
  let hasMore = true
  const pageSize = 100
  
  while (hasMore) {
    const params = buildStrapiParams({
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'fields[0]': 'slug',
      'fields[1]': 'name',
      'fields[2]': 'available',
      'fields[3]': 'questionCount',
    })
    
    const response = await fetchFromStrapi<QuizSubtopicsResponse>(
      `/api/quiz-subtopics?${params}`,
      { revalidate: REVALIDATE_SUBTOPICS, tags: ['subtopics', 'availability'] }
    )
    
    allSubtopics.push(...response.data)
    
    const pagination = response.meta?.pagination
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
      hasQuestions: subtopic.available || false,
    }
  })
  
  return availability
}

/**
 * Fetch questions with filters
 * Cached for 5 minutes
 */
export async function getQuestions(filters: {
  topic?: string
  subtopic?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  limit?: number
} = {}): Promise<QuizQuestion[]> {
  const params: Record<string, string | number> = {
    'populate[quiz_topic][fields][0]': 'topicName',
    'populate[quiz_topic][fields][1]': 'slug',
    'populate[quiz_subtopic][fields][0]': 'name',
    'populate[quiz_subtopic][fields][1]': 'slug',
  }
  
  if (filters.topic) {
    params['filters[quiz_topic][slug][$eq]'] = filters.topic
  }
  
  if (filters.subtopic) {
    params['filters[quiz_subtopic][slug][$eq]'] = filters.subtopic
  }
  
  if (filters.difficulty) {
    params['filters[difficulty][$eq]'] = filters.difficulty
  }
  
  if (filters.limit) {
    params['pagination[limit]'] = filters.limit
  }
  
  const queryString = buildStrapiParams(params)
  const tags = ['questions', filters.topic, filters.subtopic].filter(Boolean) as string[]
  
  const response = await fetchFromStrapi<QuizQuestionsResponse>(
    `/api/quiz-questions?${queryString}`,
    { revalidate: REVALIDATE_QUESTIONS, tags }
  )
  
  return response.data
}

/**
 * Utility function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Fetch quiz questions for a specific topic/subtopic
 * Cached for 5 minutes
 */
export async function getQuizQuestions(
  topicSlug?: string,
  subtopicSlug?: string,
  difficulty?: 'Easy' | 'Medium' | 'Hard',
  count: number = 5
): Promise<QuizQuestion[]> {
  const questions = await getQuestions({
    topic: topicSlug,
    subtopic: subtopicSlug,
    difficulty,
    limit: count * 2, // Get more for randomization
  })
  
  // Shuffle and return requested count
  const shuffled = shuffleArray(questions)
  return shuffled.slice(0, count)
}

/**
 * Fetch random questions with proper distribution across topics/subtopics
 * Cached for 5 minutes
 */
export async function getRandomQuestions(
  count: number = 5,
  mode: 'normal' | 'expert' | 'first-visit' = 'normal'
): Promise<QuizQuestion[]> {
  // Get all available subtopics
  const availableSubtopics = await getAvailableSubtopics()
  
  if (availableSubtopics.length === 0) {
    throw new Error('No available subtopics found')
  }
  
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
  const questionsPerTopic = Math.max(1, Math.ceil(count / topicSlugs.length))
  const selectedQuestions: QuizQuestion[] = []
  
  // Shuffle topics for random selection
  const shuffledTopics = shuffleArray(topicSlugs)
  
  for (const topicSlug of shuffledTopics) {
    if (selectedQuestions.length >= count) break
    
    const topicSubtopics = subtopicsByTopic[topicSlug]
    const shuffledSubtopics = shuffleArray(topicSubtopics)
    const subtopicsToUse = shuffledSubtopics.slice(0, Math.min(3, shuffledSubtopics.length))
    
    for (const subtopic of subtopicsToUse) {
      if (selectedQuestions.length >= count) break
      
      const questionsNeeded = Math.min(
        questionsPerTopic,
        count - selectedQuestions.length,
        Math.ceil(questionsPerTopic / subtopicsToUse.length)
      )
      
      try {
        const params: Record<string, string | number> = {
          'filters[quiz_subtopic][slug][$eq]': subtopic.slug,
          'pagination[limit]': questionsNeeded * 2,
          'populate[quiz_topic][fields][0]': 'topicName',
          'populate[quiz_topic][fields][1]': 'slug',
          'populate[quiz_subtopic][fields][0]': 'name',
          'populate[quiz_subtopic][fields][1]': 'slug',
        }
        
        // Set difficulty based on mode
        if (mode === 'first-visit') {
          params['filters[difficulty][$eq]'] = 'Easy'
        } else if (mode === 'expert') {
          params['filters[difficulty][$in][0]'] = 'Medium'
          params['filters[difficulty][$in][1]'] = 'Hard'
        } else {
          params['filters[difficulty][$in][0]'] = 'Easy'
          params['filters[difficulty][$in][1]'] = 'Medium'
        }
        
        const queryString = buildStrapiParams(params)
        
        const response = await fetchFromStrapi<QuizQuestionsResponse>(
          `/api/quiz-questions?${queryString}`,
          { revalidate: REVALIDATE_QUESTIONS, tags: ['questions', 'random', mode] }
        )
        
        const subtopicQuestions = shuffleArray(response.data)
        const questionsToAdd = subtopicQuestions.slice(0, questionsNeeded)
        
        selectedQuestions.push(...questionsToAdd)
      } catch (error) {
        console.error(`Failed to get questions from subtopic ${subtopic.slug}:`, error)
        // Continue with other subtopics
      }
    }
  }
  
  // If we don't have enough questions, try to get more from any available subtopic
  if (selectedQuestions.length < count) {
    const params: Record<string, string | number> = {
      'filters[quiz_subtopic][available][$eq]': 'true',
      'pagination[limit]': (count - selectedQuestions.length) * 2,
      'populate[quiz_topic][fields][0]': 'topicName',
      'populate[quiz_topic][fields][1]': 'slug',
      'populate[quiz_subtopic][fields][0]': 'name',
      'populate[quiz_subtopic][fields][1]': 'slug',
    }
    
    if (mode === 'first-visit') {
      params['filters[difficulty][$eq]'] = 'Easy'
    } else if (mode === 'expert') {
      params['filters[difficulty][$in][0]'] = 'Medium'
      params['filters[difficulty][$in][1]'] = 'Hard'
    } else {
      params['filters[difficulty][$in][0]'] = 'Easy'
      params['filters[difficulty][$in][1]'] = 'Medium'
    }
    
    const queryString = buildStrapiParams(params)
    
    const response = await fetchFromStrapi<QuizQuestionsResponse>(
      `/api/quiz-questions?${queryString}`,
      { revalidate: REVALIDATE_QUESTIONS, tags: ['questions', 'random', mode] }
    )
    
    // Filter out questions we already have
    const existingQuestionIds = new Set(selectedQuestions.map(q => q.id))
    const additionalQuestions = response.data.filter(q => !existingQuestionIds.has(q.id))
    
    const shuffledAdditional = shuffleArray(additionalQuestions)
    const questionsToAdd = shuffledAdditional.slice(0, count - selectedQuestions.length)
    
    selectedQuestions.push(...questionsToAdd)
  }
  
  // Final shuffle and slice to exact count
  return shuffleArray(selectedQuestions).slice(0, count)
}
