# API Integration with Strapi CMS

## 🔌 API Architecture Overview

The Gyan Pravah application integrates with **Strapi CMS** as its headless content management system. The API integration is designed with multiple layers for reliability, performance, and maintainability.

## 🏗️ API Layer Architecture

```
API Integration Layers:
├── Server-Side Client (strapi-server.ts) # Server-side data fetching with Next.js fetch
├── Client-Side Client (strapi.ts)        # Minimal client-side API calls
└── Analytics (analytics.ts)              # User behavior tracking
```

**Simplified Architecture:**
- Server components use `strapi-server.ts` with Next.js fetch and caching
- Client components use minimal `strapi.ts` only when necessary
- No complex retry logic or error handling layers
- Simple, straightforward API integration

## 🎯 Server-Side Strapi Client (`strapi-server.ts`)

The server-side client uses Next.js fetch with caching for optimal performance.

### Configuration

```typescript
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

// Server-side fetch with caching
export async function getTopicsWithAvailability() {
  const res = await fetch(`${STRAPI_URL}/api/quiz-topics?populate=*`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch topics')
  }
  
  return res.json()
}
```

**Key Features:**
- **Next.js fetch** - Built-in caching and revalidation
- **Server-side only** - No client-side JavaScript
- **Simple error handling** - Throw errors for Next.js to catch
- **Environment-based URLs** - Automatic dev/production switching

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

## 🎮 Client-Side Strapi Client (`strapi.ts`)

Minimal client-side API calls for interactive features.

### Simple Client-Side Fetching

```typescript
// Only used when server-side fetching isn't possible
export async function getRandomQuestions(count: number = 7) {
  const res = await fetch(`${STRAPI_URL}/api/quiz-questions?pagination[limit]=${count}`)
  
  if (!res.ok) {
    throw new Error('Failed to fetch questions')
  }
  
  const data = await res.json()
  return data.data
}
```

**Usage:**
- Only for client-side interactions
- No complex retry logic
- Simple error handling
- Minimal JavaScript bundle

## 📊 Analytics Integration (`analytics.ts`)

Comprehensive user behavior tracking with PostHog.

**📖 For complete analytics documentation, see:** [`docs/analytics-readme.md`](../analytics-readme.md)

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

### Server Component Integration

```typescript
// Server Component - No loading states needed
export default async function QuizPage({ params }: { params: { topic: string, subtopic: string } }) {
  // Fetch server-side with caching
  const questions = await getQuizQuestions(params.topic, params.subtopic)
  
  // Pass to client component
  return <QuizGame questions={questions} />
}

// Server-side fetch function
async function getQuizQuestions(topic: string, subtopic: string) {
  const res = await fetch(
    `${STRAPI_URL}/api/quiz-questions?filters[quiz_topic][slug]=${topic}&filters[quiz_subtopic][slug]=${subtopic}`,
    {
      next: { revalidate: 300 } // Cache for 5 minutes
    }
  )
  
  if (!res.ok) throw new Error('Failed to fetch questions')
  const data = await res.json()
  return data.data
}
```

### Error Handling with error.tsx

```typescript
// app/quiz/[topic]/[subtopic]/error.tsx
'use client'

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Failed to load quiz</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button onClick={reset} className="bg-[#8B7FC8] text-white px-6 py-3 rounded-xl">
          Try again
        </button>
      </div>
    </div>
  )
}
```

### Caching Strategy

```typescript
// Next.js handles caching automatically
// Revalidate every hour for topics
next: { revalidate: 3600 }

// Revalidate every 5 minutes for questions
next: { revalidate: 300 }

// No cache for user-specific data
cache: 'no-store'
```

## 🚀 Performance Optimizations

### Server-Side Optimizations

1. **Next.js Caching** - Automatic caching with revalidation
2. **Server Components** - No client-side JavaScript for data fetching
3. **Field Selection** - Only fetch required fields
4. **Population** - Include related data in single requests

### Bundle Optimization

1. **Server Components** - Reduced client-side JavaScript
2. **Minimal Client API** - Only essential client-side calls
3. **Code Splitting** - Automatic with Next.js

### Error Handling

1. **Simple error.tsx** - Next.js built-in error handling
2. **Clear Error Messages** - User-friendly feedback
3. **Retry Options** - Simple retry buttons
4. **Server-Side Errors** - Caught and handled by Next.js

This simplified API integration provides better performance, easier maintenance, and a cleaner codebase while leveraging Next.js built-in features.