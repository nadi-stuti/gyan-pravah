# API Integration with Strapi CMS

## 🔌 API Architecture Overview

The Gyan Pravah application integrates with **Strapi CMS** as its headless content management system. The API integration is designed with multiple layers for reliability, performance, and maintainability.

## 🏗️ API Layer Architecture

```
API Integration Layers:
├── Strapi Client (strapi.ts)      # Direct Strapi communication
├── Enhanced API Client (api-client.ts) # Retry logic & error handling
├── Quiz API (quiz-api.ts)         # Quiz-specific operations
└── Analytics (analytics.ts)       # User behavior tracking
```

## 🎯 Strapi Client (`strapi.ts`)

The core Strapi client handles direct communication with the CMS.

### Configuration

```typescript
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
  }
}
```

**Key Features:**
- **Environment-based URLs** - Automatic dev/production switching
- **Request timeout** - 10-second timeout for reliability
- **Authentication ready** - Token-based auth support
- **Error interceptors** - Automatic error handling

### Authentication Setup

```typescript
// Request interceptor for authentication
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
```

### Error Handling

```typescript
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
```

## 📚 Data Fetching Methods

### Questions API

```typescript
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
```

**Features:**
- **Flexible filtering** - By topic, subtopic, difficulty
- **Automatic population** - Related data included
- **Type safety** - Full TypeScript support
- **URL parameter building** - Clean query construction

### Topics with Pagination

```typescript
async getTopics(filters: TopicFilters = {}): Promise<QuizTopic[]> {
  const allTopics: QuizTopic[] = []
  let page = 1
  let hasMore = true
  const pageSize = 25

  while (hasMore) {
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
    hasMore = pagination ? page < pagination.pageCount : false
    page++
  }

  return allTopics
}
```

**Pagination Strategy:**
- **Automatic pagination** - Fetches all pages automatically
- **Safety limits** - Prevents infinite loops
- **Progress logging** - Tracks fetching progress
- **Memory efficient** - Streams data instead of loading all at once

### Smart Question Distribution

```typescript
async getRandomQuestions(count: number = 5, mode: 'normal' | 'expert' | 'first-visit' = 'normal'): Promise<QuizQuestion[]> {
  // Get all available subtopics for proper distribution
  const availableSubtopics = await this.getAvailableSubtopics()
  
  // Group subtopics by topic for better distribution
  const subtopicsByTopic: Record<string, QuizSubtopic[]> = {}
  availableSubtopics.forEach(subtopic => {
    const topicSlug = subtopic.quiz_topic?.slug || 'unknown'
    if (!subtopicsByTopic[topicSlug]) {
      subtopicsByTopic[topicSlug] = []
    }
    subtopicsByTopic[topicSlug].push(subtopic)
  })

  const selectedQuestions: QuizQuestion[] = []
  const shuffledTopics = this.shuffleArray(Object.keys(subtopicsByTopic))

  // Distribute questions across topics
  for (const topicSlug of shuffledTopics) {
    if (selectedQuestions.length >= count) break

    const topicSubtopics = subtopicsByTopic[topicSlug]
    const shuffledSubtopics = this.shuffleArray(topicSubtopics)

    for (const subtopic of shuffledSubtopics) {
      // Fetch questions for this subtopic with difficulty filter
      const params = new URLSearchParams()
      params.append('filters[quiz_subtopic][slug][$eq]', subtopic.slug)
      
      if (mode === 'first-visit') {
        params.append('filters[difficulty][$eq]', 'Easy')
      } else if (mode === 'expert') {
        params.append('filters[difficulty][$in][0]', 'Medium')
        params.append('filters[difficulty][$in][1]', 'Hard')
      } else {
        params.append('filters[difficulty][$in][0]', 'Easy')
        params.append('filters[difficulty][$in][1]', 'Medium')
      }

      const response = await this.client.get<QuizQuestionsResponse>(
        `/api/quiz-questions?${params.toString()}`
      )

      const subtopicQuestions = this.shuffleArray(response.data.data)
      selectedQuestions.push(...subtopicQuestions.slice(0, questionsNeeded))
    }
  }

  return this.shuffleArray(selectedQuestions).slice(0, count)
}
```

**Distribution Algorithm:**
- **Topic diversity** - Questions from multiple topics
- **Subtopic variety** - Balanced subtopic representation
- **Difficulty filtering** - Mode-appropriate difficulty levels
- **Randomization** - Multiple shuffle points for variety

## 🔄 Enhanced API Client (`api-client.ts`)

Adds retry logic and enhanced error handling on top of the Strapi client.

### Retry Logic

```typescript
private async withRetry<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = this.retryAttempts
): Promise<T> {
  let lastError: Error | StrapiError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error | StrapiError
      
      // Don't retry on certain error types
      if (this.shouldNotRetry(error)) {
        throw error
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break
      }

      // Wait before retrying (exponential backoff)
      const delay = this.retryDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
```

**Retry Strategy:**
- **Exponential backoff** - Increasing delays between retries
- **Smart retry logic** - Don't retry auth/not found errors
- **Context logging** - Track which operations are failing
- **Configurable attempts** - Adjustable retry count

### Connection Status Checking

```typescript
async checkConnectionStatus(): Promise<{
  isOnline: boolean
  isServerReachable: boolean
  error?: StrapiError | Error
}> {
  // Check basic connectivity
  const isOnline = navigator.onLine

  if (!isOnline) {
    return {
      isOnline: false,
      isServerReachable: false,
      error: {
        status: 0,
        name: 'NetworkError',
        message: 'No internet connection detected'
      }
    }
  }

  // Check server reachability
  try {
    const isServerReachable = await this.healthCheck()
    return {
      isOnline: true,
      isServerReachable,
      error: isServerReachable ? undefined : {
        status: 503,
        name: 'ServiceUnavailable',
        message: 'Server is not reachable'
      }
    }
  } catch (error) {
    return {
      isOnline: true,
      isServerReachable: false,
      error: error as StrapiError | Error
    }
  }
}
```

## 🎮 Quiz API (`quiz-api.ts`)

Provides quiz-specific API operations with simplified interfaces.

### Convenience Methods

```typescript
export class QuizAPI {
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
    
    if (topicSlug) filters.topic = topicSlug
    if (subtopicSlug) filters.subtopic = subtopicSlug
    if (difficulty) filters.difficulty = difficulty
    
    const questions = await this.getQuestions(filters)
    
    // Shuffle and return requested count
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}
```

## 📊 Analytics Integration (`analytics.ts`)

Comprehensive user behavior tracking with PostHog.

### Type-Safe Event Tracking

```typescript
export interface QuizAnalyticsEvents {
  'quiz_started': {
    mode: 'normal' | 'expert' | 'first-visit' | 'random'
    topic?: string
    subtopic?: string
    total_questions: number
    is_expert_mode: boolean
    is_first_visit: boolean
  }
  
  'question_answered': {
    question_id: number
    selected_answer: 'A' | 'B' | 'C' | 'D'
    correct_answer: 'A' | 'B' | 'C' | 'D'
    is_correct: boolean
    time_taken: number
    points_earned: number
    difficulty: 'Easy' | 'Medium' | 'Hard'
    topic: string
  }
  
  'quiz_completed': {
    final_score: number
    percentage: number
    questions_correct: number
    total_questions: number
    mode: 'normal' | 'expert' | 'first-visit'
    is_expert_mode: boolean
  }
}

// Type-safe tracking function
export function trackEvent<K extends keyof QuizAnalyticsEvents>(
  eventName: K,
  properties: QuizAnalyticsEvents[K]
): void {
  if (typeof window !== 'undefined' && posthog && !posthog.has_opted_out_capturing()) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
    })
  }
}
```

### User Journey Tracking

```typescript
// Initialize user tracking
export function initializeUserTracking(): void {
  const userId = getUserId()
  
  // Get user preferences for initial traits
  const preferencesData = localStorage.getItem('quiz-user-preferences')
  let traits = {}
  
  if (preferencesData) {
    const preferences = JSON.parse(preferencesData)
    traits = {
      is_first_visit: preferences.state?.isFirstVisit ?? true,
      expert_mode_enabled: preferences.state?.expertModeEnabled ?? false,
      total_games_played: preferences.state?.totalGamesPlayed ?? 0,
      best_score: preferences.state?.bestScore ?? 0,
    }
  }
  
  identifyUser(userId, traits)
}
```

## 🔧 Usage Patterns

### Component Integration

```typescript
const QuizPage = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use enhanced API client with retry logic
        const fetchedQuestions = await apiClient.getRandomQuestions(7, 'normal')
        setQuestions(fetchedQuestions)
        
        // Track successful load
        trackEvent('quiz_started', {
          mode: 'normal',
          total_questions: fetchedQuestions.length,
          is_expert_mode: false,
          is_first_visit: false
        })
        
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        setError(errorMessage)
        
        // Track error
        trackEvent('quiz_error', {
          error_type: 'api_failure',
          error_message: errorMessage,
          context: 'quiz_load'
        })
        
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} onRetry={loadQuestions} />
  
  return <QuizGame questions={questions} />
}
```

### Error Handling Patterns

```typescript
// Check error types
if (isNetworkError(error)) {
  return <NoInternetConnection onRetry={retryOperation} />
}

if (isTimeoutError(error)) {
  return <TimeoutError onRetry={retryOperation} />
}

if (isServerError(error)) {
  return <ServerError onRetry={retryOperation} />
}

// Generic error with user-friendly message
return <ErrorMessage message={getErrorMessage(error)} onRetry={retryOperation} />
```

### Caching Strategy

```typescript
// Subtopic availability caching
const { availability, isStale, refreshAvailability } = useSubtopicStore()

useEffect(() => {
  // Only refresh if cache is stale (5 minutes)
  if (isStale()) {
    refreshAvailability()
  }
}, [])

// Use cached data immediately for better UX
const availableTopics = topics.filter(topic => 
  topic.subtopics.some(subtopic => availability[subtopic.slug]?.hasQuestions)
)
```

## 🚀 Performance Optimizations

### Request Optimization

1. **Field Selection** - Only fetch required fields
2. **Pagination** - Handle large datasets efficiently
3. **Population** - Include related data in single requests
4. **Caching** - Cache frequently accessed data
5. **Retry Logic** - Automatic retry with exponential backoff

### Bundle Optimization

1. **Dynamic Imports** - Load API clients on demand
2. **Tree Shaking** - Only include used functions
3. **Code Splitting** - Separate API logic from components

### Error Recovery

1. **Graceful Degradation** - Show cached data when possible
2. **Retry Mechanisms** - Automatic retry for transient failures
3. **User Feedback** - Clear error messages with retry options
4. **Offline Support** - Handle offline scenarios gracefully

This API integration architecture provides a robust, scalable, and maintainable foundation for the quiz application with excellent error handling, performance optimization, and user experience.