# Data Flow Architecture

## 🌊 Data Flow Overview

The Gyan Pravah application implements a unidirectional data flow architecture that ensures predictable state management, efficient data loading, and seamless user experience. Data flows from the Strapi CMS through API clients, into Zustand stores, and finally to React components.

## 🏗️ Data Flow Architecture

```
Data Flow Layers:
┌─────────────────┐
│   Strapi CMS    │ ← Content Management
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Server Components│ ← Server-side fetch with Next.js caching
└─────────────────┘
         │
         ▼
┌─────────────────┐
│Client Components│ ← Interactive UI (minimal state)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Zustand Stores  │ ← Minimal client state (quiz game only)
└─────────────────┘
```

**Simplified Architecture:**
- Server components fetch data with Next.js caching
- Client components receive data as props
- Minimal Zustand stores for interactive state only
- No complex API client layers

## 📊 Data Sources and Types

### Primary Data Sources

**Strapi CMS (Server-Side):**
- Quiz questions with options and explanations
- Topics and subtopics with availability status
- Fetched server-side with Next.js caching

**Local Storage (Client-Side):**
- User preferences (expert mode, first visit)
- Minimal persisted state

**Client State (Zustand):**
- Active quiz game state
- Current question and answers
- Score and progress

### Data Types

```typescript
// Core data types
interface QuizQuestion {
  id: number
  question: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  correctOption: 'A' | 'B' | 'C' | 'D'
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  quiz_topic?: QuizTopic
  quiz_subtopic?: QuizSubtopic
}

interface QuizTopic {
  id: number
  slug: string
  topicName: string
  topicIcon?: string
  quiz_subtopics?: QuizSubtopic[]
}

interface QuizSubtopic {
  id: number
  slug: string
  name: string
  available: boolean
  questionCount: number
  quiz_topic?: QuizTopic
}
```

## 🔄 Data Flow Patterns

### 1. Quiz Data Flow

**Complete Quiz Flow:**
```typescript
// 1. User initiates quiz
const startQuiz = async (mode: QuizMode) => {
  // 2. Reset quiz state
  resetQuiz()
  
  // 3. Load questions from API
  const questions = await strapiClient.getRandomQuestions(7, mode)
  
  // 4. Update store with questions
  setQuestions(questions)
  setQuizMode(mode)
  setGameStatus('playing')
  
  // 5. Navigate to quiz page
  router.push('/quiz')
}

// 6. During quiz - answer selection
const handleAnswer = (answer: string) => {
  const isCorrect = answer === currentQuestion.correctOption
  const timeTaken = config.questionTimeLimit - timeRemaining
  
  // 7. Calculate points
  const points = calculatePoints(timeRemaining, isCorrect)
  
  // 8. Record result in store
  recordQuestionResult(currentQuestion, answer, points, isCorrect)
  
  // 9. Record reaction time
  recordReactionTime(timeTaken)
  
  // 10. Track analytics
  trackEvent('question_answered', { 
    is_correct: isCorrect,
    time_taken: timeTaken,
    points_earned: points
  })
  
  // 11. Show appropriate feedback
  if (isCorrect) {
    setShowFeedback(true) // Popup for correct
  } else {
    setShowCorrectAnswer(true) // Show on card for wrong
  }
  
  // 12. Progress to next question or complete
  if (isLastQuestion) {
    completeQuiz()
  } else {
    nextQuestion()
  }
}
```

### 2. Topic Selection Flow (Server-Side)

**Server Component Data Loading:**
```typescript
// 1. Server component fetches data
// app/topics/page.tsx
export default async function TopicsPage() {
  // 2. Fetch server-side with caching
  const topics = await getTopicsWithAvailability()
  
  // 3. Pass to client component
  return <TopicGrid topics={topics} />
}

// 4. Client component handles interaction
'use client'
export function TopicGrid({ topics }: { topics: QuizTopic[] }) {
  const router = useRouter()
  
  // 5. User selects topic
  const handleTopicSelect = (topic: QuizTopic) => {
    // 6. Navigate to subtopics
    router.push(`/topics/${topic.slug}`)
  }
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {topics.map(topic => (
        <button key={topic.id} onClick={() => handleTopicSelect(topic)}>
          {topic.topicName}
        </button>
      ))}
    </div>
  )
}
```

**Benefits:**
- No loading states needed
- Automatic caching by Next.js
- Faster initial page load
- Simpler code

### 3. User Preferences Flow

**Preference Management:**
```typescript
// 1. Load preferences on app start
const { 
  expertModeEnabled, 
  setExpertModeEnabled,
  incrementGamesPlayed,
  setBestScore 
} = useUserPreferences()

// 2. Update preferences during gameplay
const handleExpertModeToggle = (enabled: boolean) => {
  // 3. Update store (automatically persists)
  setExpertModeEnabled(enabled)
  
  // 4. Sync with analytics
  setUserProperties({ expert_mode_enabled: enabled })
  
  // 5. Track event
  trackEvent('expert_mode_toggled', { enabled })
}

// 6. Update stats after quiz completion
const handleQuizComplete = (score: number) => {
  // 7. Update game statistics
  incrementGamesPlayed()
  setBestScore(score)
  
  // 8. Sync with analytics
  trackQuizPerformance(score, maxScore, questionsCorrect, totalQuestions)
}
```

## 🗄️ State Management Flow (Simplified)

### Minimal Zustand Store Usage

**Quiz Store Data Flow:**
```typescript
// Only for interactive quiz state
const QuizComponent = () => {
  // 1. Subscribe to quiz state
  const currentQuestion = useQuizStore(state => state.currentQuestion)
  const totalScore = useQuizStore(state => state.totalScore)
  
  // 2. Get actions
  const { recordQuestionResult } = useQuizStore()
  
  // 3. Handle user interaction
  const handleAnswer = (answer: string) => {
    const points = calculatePoints(answer)
    recordQuestionResult(currentQuestion, answer, points, isCorrect)
  }
  
  // 4. UI reflects state
  return <QuizInterface score={totalScore} />
}
```

### User Preferences (Minimal)

**Simple Preference Management:**
```typescript
// Only two persisted preferences
const { expertModeEnabled, setExpertModeEnabled } = useUserPreferences()

// Toggle expert mode
const handleToggle = () => {
  setExpertModeEnabled(!expertModeEnabled)
}
```

**No cross-store communication needed** - Simplified architecture eliminates complexity.

## 🔄 Caching Strategy (Next.js)

### Server-Side Caching with Next.js

**Automatic Caching:**
```typescript
// Topics - cache for 1 hour
const res = await fetch(`${STRAPI_URL}/api/quiz-topics`, {
  next: { revalidate: 3600 }
})

// Questions - cache for 5 minutes
const res = await fetch(`${STRAPI_URL}/api/quiz-questions`, {
  next: { revalidate: 300 }
})

// User-specific - no cache
const res = await fetch(`${STRAPI_URL}/api/user-data`, {
  cache: 'no-store'
})
```

**Benefits:**
- Automatic cache management by Next.js
- No manual cache invalidation needed
- Consistent caching across requests
- Better performance with less code

### Client-Side Persistence

**Only for User Preferences:**
```typescript
// Zustand persist middleware
export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set) => ({
      isFirstVisit: true,
      expertModeEnabled: false,
      setFirstVisit: (value) => set({ isFirstVisit: value }),
      setExpertModeEnabled: (enabled) => set({ expertModeEnabled: enabled }),
    }),
    { name: 'quiz-user-preferences' }
  )
)
```

**No complex cache management** - Next.js handles everything automatically.

## 📡 API Integration Flow (Simplified)

### Server Component Request Flow

**Simple Server-Side Fetching:**
```typescript
// Server component - no loading states needed
export default async function QuizPage({ params }) {
  // 1. Fetch server-side with caching
  const questions = await getQuizQuestions(params.topic, params.subtopic)
  
  // 2. Pass to client component
  return <QuizGame questions={questions} />
}

// Server-side fetch with automatic caching
async function getQuizQuestions(topic: string, subtopic: string) {
  const res = await fetch(
    `${STRAPI_URL}/api/quiz-questions?filters[topic]=${topic}`,
    { next: { revalidate: 300 } }
  )
  
  if (!res.ok) throw new Error('Failed to fetch questions')
  return res.json()
}
```

### Error Handling with error.tsx

**Simple Error Handling:**
```typescript
// app/quiz/[topic]/[subtopic]/error.tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button onClick={reset} className="bg-[#8B7FC8] text-white px-6 py-3 rounded-xl">
          Try again
        </button>
      </div>
    </div>
  )
}
```

**Benefits:**
- No complex error classification
- Simple, user-friendly messages
- Built-in Next.js error handling
- Less code to maintain

## 🔄 Real-time Updates

### Live Data Synchronization

**Quiz State Synchronization:**
```typescript
// Real-time quiz state updates
const QuizGameLogic = () => {
  const {
    currentQuestion,
    selectedAnswers,
    totalScore,
    recordQuestionResult
  } = useQuizStore()
  
  // Update store immediately on answer selection
  const handleAnswer = (answer: string) => {
    const points = calculatePoints(answer, timeRemaining)
    
    // Immediate store update
    recordQuestionResult(currentQuestion, answer, points, isCorrect)
    
    // UI updates automatically via store subscription
    // No need for manual state management
  }
  
  // Store changes trigger re-renders automatically
  return (
    <QuizInterface 
      score={totalScore} 
      answers={selectedAnswers}
      currentQuestion={currentQuestion}
    />
  )
}
```

### Optimistic Updates

**Immediate UI Feedback:**
```typescript
// Optimistic update pattern
const handleUserAction = async (action: UserAction) => {
  // 1. Update UI immediately (optimistic)
  updateUIOptimistically(action)
  
  try {
    // 2. Send request to server
    const result = await apiClient.performAction(action)
    
    // 3. Confirm update with server response
    confirmUpdate(result)
    
  } catch (error) {
    // 4. Revert optimistic update on failure
    revertOptimisticUpdate(action)
    
    // 5. Show error message
    showErrorMessage(error)
  }
}
```

## 📊 Performance Optimization (Simplified)

### Server Component Benefits

**Automatic Optimizations:**
```typescript
// Server components are automatically optimized
export default async function TopicsPage() {
  // Fetched once on server, cached by Next.js
  const topics = await getTopicsWithAvailability()
  
  // No client-side JavaScript for data fetching
  return <TopicGrid topics={topics} />
}
```

**Benefits:**
- No loading states needed
- Reduced JavaScript bundle
- Automatic caching
- Better performance

### Client State Optimization

**Minimal State Updates:**
```typescript
// Only subscribe to what you need
const QuizComponent = () => {
  // ✅ Good - specific fields only
  const currentQuestion = useQuizStore(state => state.currentQuestion)
  const totalScore = useQuizStore(state => state.totalScore)
  
  return <QuizInterface score={totalScore} />
}
```

**Simplified approach:**
- Less state to manage
- Fewer re-renders
- Better performance
- Easier to understand

## 🔍 Data Flow Debugging

### Debug Tools

**Store State Inspection:**
```typescript
// Debug store state
const debugStoreState = () => {
  console.log('Quiz Store:', useQuizStore.getState())
  console.log('User Preferences:', useUserPreferences.getState())
  console.log('Subtopic Store:', useSubtopicStore.getState())
}

// Track state changes
useQuizStore.subscribe(
  (state) => state.totalScore,
  (totalScore, previousScore) => {
    console.log(`Score updated: ${previousScore} → ${totalScore}`)
  }
)
```

**API Request Monitoring:**
```typescript
// Monitor API requests
const monitorAPIRequests = () => {
  const originalFetch = window.fetch
  
  window.fetch = async (...args) => {
    const start = performance.now()
    console.log('API Request:', args[0])
    
    try {
      const response = await originalFetch(...args)
      const end = performance.now()
      console.log(`API Response: ${response.status} (${end - start}ms)`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}
```

This simplified data flow architecture leverages Next.js server components and built-in caching to provide excellent performance with minimal complexity. The server-first approach reduces client-side JavaScript, improves initial load times, and makes the codebase easier to understand and maintain.