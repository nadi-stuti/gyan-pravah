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
│   API Client    │ ← HTTP Requests & Caching
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Zustand Stores  │ ← State Management
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ React Components│ ← UI Rendering
└─────────────────┘
```

## 📊 Data Sources and Types

### Primary Data Sources

**Strapi CMS:**
- Quiz questions with options and explanations
- Topics and subtopics with availability status
- User-generated content and media assets

**Local Storage:**
- User preferences and settings
- Quiz progress and scores
- Cached API responses

**Session Storage:**
- Temporary quiz state
- Navigation history
- Performance metrics

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

### 2. Topic Selection Flow

**Topic Loading and Selection:**
```typescript
// 1. Load topics on page mount
useEffect(() => {
  const loadTopics = async () => {
    try {
      setLoading(true)
      
      // 2. Fetch from API with caching
      const topics = await strapiClient.getTopics()
      
      // 3. Load availability if stale
      if (isStale()) {
        const availability = await strapiClient.getSubtopicAvailability()
        setAvailability(availability)
      }
      
      // 4. Update component state
      setTopics(topics)
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }
  
  loadTopics()
}, [])

// 5. User selects topic
const handleTopicSelect = (topic: QuizTopic) => {
  // 6. Track selection
  trackEvent('topic_selected', { topic: topic.slug })
  
  // 7. Navigate to subtopics
  router.push(`/topics/subtopics?topic=${topic.slug}`)
}
```

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

## 🗄️ State Management Flow

### Zustand Store Integration

**Quiz Store Data Flow:**
```typescript
// Store state updates flow through selectors
const QuizComponent = () => {
  // 1. Subscribe to specific store slices
  const currentQuestion = useQuizStore(state => state.currentQuestion)
  const totalScore = useQuizStore(state => state.totalScore)
  const questions = useQuizStore(state => state.questions)
  
  // 2. Get actions
  const { recordQuestionResult, setCurrentQuestion } = useQuizStore()
  
  // 3. Component logic triggers store updates
  const handleAnswer = (answer: string) => {
    const points = calculatePoints(answer)
    
    // 4. Store update triggers re-render
    recordQuestionResult(currentQuestion, answer, points, isCorrect)
  }
  
  // 5. UI reflects new state
  return <QuizInterface score={totalScore} question={questions[currentQuestion]} />
}
```

### Cross-Store Communication

**Store Dependencies:**
```typescript
// Quiz completion affects multiple stores
const completeQuiz = () => {
  // 1. Get final quiz data
  const { totalScore, questionsCorrect } = useQuizStore.getState()
  
  // 2. Update user preferences
  const { incrementGamesPlayed, setBestScore } = useUserPreferences.getState()
  incrementGamesPlayed()
  setBestScore(totalScore)
  
  // 3. Clear temporary data if needed
  // (Quiz store maintains data for results page)
}
```

## 🔄 Caching Strategy

### Multi-Level Caching

**1. Memory Cache (Runtime):**
```typescript
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private ttl = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }
}
```

**2. Persistent Cache (Zustand):**
```typescript
export const useSubtopicStore = create<SubtopicStore>()(
  persist(
    (set, get) => ({
      availability: {},
      lastUpdated: null,
      
      isStale: () => {
        const { lastUpdated } = get()
        if (!lastUpdated) return true
        return Date.now() - lastUpdated > CACHE_DURATION
      },
      
      setAvailability: (availability) => set({ 
        availability, 
        lastUpdated: Date.now() 
      })
    }),
    { name: 'subtopic-availability-cache' }
  )
)
```

**3. HTTP Cache (Browser):**
```typescript
// API client with caching headers
this.client.interceptors.response.use(
  (response) => {
    // Cache successful responses
    if (response.status === 200) {
      response.headers['cache-control'] = 'max-age=300' // 5 minutes
    }
    return response
  }
)
```

### Cache Invalidation

**Smart Cache Updates:**
```typescript
// Invalidate cache when data changes
const updateTopicAvailability = async () => {
  // 1. Clear stale cache
  clearCache()
  
  // 2. Fetch fresh data
  const availability = await strapiClient.getSubtopicAvailability()
  
  // 3. Update cache with new data
  setAvailability(availability)
  
  // 4. Notify components of update
  notifySubscribers('availability_updated', availability)
}
```

## 📡 API Integration Flow

### Request Lifecycle

**Complete API Request Flow:**
```typescript
// 1. Component initiates request
const loadQuestions = async () => {
  try {
    setLoading(true)
    setError(null)
    
    // 2. Check cache first
    const cached = getCachedData('questions')
    if (cached && !isStale(cached)) {
      setQuestions(cached.data)
      setLoading(false)
      return
    }
    
    // 3. Make API request with retry logic
    const questions = await apiClient.getRandomQuestions(7, 'normal')
    
    // 4. Cache successful response
    setCachedData('questions', questions)
    
    // 5. Update component state
    setQuestions(questions)
    
    // 6. Track successful load
    trackEvent('questions_loaded', { count: questions.length })
    
  } catch (error) {
    // 7. Handle errors
    const errorMessage = getErrorMessage(error)
    setError(errorMessage)
    
    // 8. Track error
    trackEvent('questions_load_error', { error: errorMessage })
    
    // 9. Attempt fallback if available
    const fallbackData = getFallbackData()
    if (fallbackData) {
      setQuestions(fallbackData)
    }
  } finally {
    setLoading(false)
  }
}
```

### Error Handling Flow

**Comprehensive Error Management:**
```typescript
// Error handling pipeline
const handleAPIError = (error: any) => {
  // 1. Classify error type
  const errorType = classifyError(error)
  
  // 2. Apply appropriate handling strategy
  switch (errorType) {
    case 'network':
      // Show offline message, enable retry
      showOfflineMessage()
      enableRetryButton()
      break
      
    case 'timeout':
      // Show timeout message, auto-retry
      showTimeoutMessage()
      scheduleRetry(5000)
      break
      
    case 'server':
      // Show server error, contact support
      showServerErrorMessage()
      enableSupportContact()
      break
      
    case 'client':
      // Log error, show generic message
      logClientError(error)
      showGenericErrorMessage()
      break
  }
  
  // 3. Track error for analytics
  trackEvent('api_error', {
    error_type: errorType,
    error_message: error.message,
    endpoint: error.config?.url
  })
}
```

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

## 📊 Performance Optimization

### Data Loading Optimization

**Efficient Data Fetching:**
```typescript
// Parallel data loading
const loadQuizData = async () => {
  const [questions, topics, availability] = await Promise.all([
    strapiClient.getRandomQuestions(7, 'normal'),
    strapiClient.getTopics(),
    strapiClient.getSubtopicAvailability()
  ])
  
  // Update stores in parallel
  setQuestions(questions)
  setTopics(topics)
  setAvailability(availability)
}

// Incremental loading
const loadQuestionsIncrementally = async () => {
  // Load first batch immediately
  const firstBatch = await strapiClient.getQuestions({ limit: 3 })
  setQuestions(firstBatch)
  
  // Load remaining questions in background
  const remainingQuestions = await strapiClient.getQuestions({ 
    limit: 4, 
    offset: 3 
  })
  setQuestions(prev => [...prev, ...remainingQuestions])
}
```

### Memory Management

**Efficient State Updates:**
```typescript
// Avoid unnecessary re-renders
const QuizComponent = () => {
  // ❌ Bad - subscribes to entire store
  const state = useQuizStore()
  
  // ✅ Good - subscribes to specific fields
  const currentQuestion = useQuizStore(state => state.currentQuestion)
  const totalScore = useQuizStore(state => state.totalScore)
  
  // ✅ Better - memoized selector
  const quizProgress = useQuizStore(
    useCallback(state => ({
      current: state.currentQuestion,
      total: state.questions.length,
      percentage: (state.currentQuestion / state.questions.length) * 100
    }), [])
  )
}
```

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

This data flow architecture ensures predictable, efficient, and maintainable data management throughout the Gyan Pravah application, providing excellent user experience while maintaining code quality and performance.