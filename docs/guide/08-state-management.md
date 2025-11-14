# State Management with Zustand

## 🏪 State Management Overview

Gyan Pravah uses **Zustand** for state management, providing a lightweight, TypeScript-first solution with excellent developer experience. The application uses three main stores to manage different aspects of the application state.

## 🗂️ Store Architecture

```
stores/
├── useQuizStore.ts        # Quiz game state and logic
├── useUserPreferences.ts  # User settings and preferences (persisted)
└── useSubtopicStore.ts   # Topic availability cache (persisted)
```

## 🎮 Quiz Store (`useQuizStore`)

The quiz store manages all game-related state and is the most complex store in the application.

### State Structure

```typescript
interface QuizState {
  // Game flow
  currentQuestion: number
  selectedAnswers: Record<number, string>
  timeRemaining: number
  isExpertMode: boolean
  gameStatus: 'idle' | 'playing' | 'completed'
  questions: QuizQuestion[]
  
  // Quiz configuration
  quizMode: 'quizup' | 'quick' | 'marathon' | 'first-visit' | null
  quizSource: 'random' | 'topic' | 'first-visit' | null // Track quiz origin for replay
  quizTopicSlug: string | null // Store topic for replay
  quizSubtopicSlug: string | null // Store subtopic for replay
  quizDifficulty: 'Easy' | 'Medium' | 'Hard' | null // Store difficulty for replay
  
  // Results data (calculated during gameplay)
  pointsPerQuestion: Record<number, number>
  totalScore: number
  questionsCorrect: number
  questionsAnswered: number
  maxPossibleScore: number
  percentage: number
  reactionTimes: number[] // Time taken per question in seconds
  averageReactionTime: number // Running average reaction time
}
```

### Key Features

**Real-time Score Calculation:**
```typescript
recordQuestionResult: (questionIndex, answer, points, isCorrect) => {
  const state = get()
  const newTotalScore = state.totalScore + points
  const newQuestionsCorrect = state.questionsCorrect + (isCorrect ? 1 : 0)
  const newQuestionsAnswered = state.questionsAnswered + 1
  const newPercentage = Math.round((newQuestionsCorrect / state.questions.length) * 100)
  
  set({
    selectedAnswers: { ...state.selectedAnswers, [questionIndex]: answer },
    pointsPerQuestion: { ...state.pointsPerQuestion, [questionIndex]: points },
    totalScore: newTotalScore,
    questionsCorrect: newQuestionsCorrect,
    questionsAnswered: newQuestionsAnswered,
    percentage: newPercentage
  })
}
```

**Reaction Time Tracking:**
```typescript
recordReactionTime: (time) => {
  const state = get()
  const newReactionTimes = [...state.reactionTimes, time]
  const average = newReactionTimes.reduce((sum, t) => sum + t, 0) / newReactionTimes.length
  
  set({
    reactionTimes: newReactionTimes,
    averageReactionTime: average
  })
}
```

**Quiz Metadata Management:**
```typescript
setQuizMetadata: (source, topicSlug, subtopicSlug, difficulty) => set({
  quizSource: source,
  quizTopicSlug: topicSlug || null,
  quizSubtopicSlug: subtopicSlug || null,
  quizDifficulty: difficulty || null
})
```

**Game State Management:**
```typescript
// Start a new quiz
const startQuiz = (questions: QuizQuestion[], mode: QuizMode) => {
  resetQuiz()
  setQuestions(questions)
  setQuizMode(mode)
  setGameStatus('playing')
  setQuizConfig(calculateMaxScore(questions, mode))
}

// Complete quiz
const completeQuiz = () => {
  setGameStatus('completed')
  // Results are already calculated in real-time
}
```

### Usage Patterns

**In Quiz Components:**
```typescript
const QuizGameLogic = () => {
  const {
    questions,
    currentQuestion,
    selectedAnswers,
    totalScore,
    recordQuestionResult,
    setCurrentQuestion
  } = useQuizStore()
  
  const handleAnswerSelect = (answer: string) => {
    const isCorrect = answer === questions[currentQuestion].correctOption
    const points = calculatePoints(isCorrect, timeLeft, isExpertMode)
    
    // Record the result immediately
    recordQuestionResult(currentQuestion, answer, points, isCorrect)
    
    // Move to next question
    setCurrentQuestion(currentQuestion + 1)
  }
}
```

**In Results Components:**
```typescript
const ResultsPage = () => {
  const {
    totalScore,
    questionsCorrect,
    questions,
    percentage,
    pointsPerQuestion
  } = useQuizStore()
  
  // All data is already calculated and available
  return (
    <div>
      <h1>Score: {totalScore}</h1>
      <p>{questionsCorrect}/{questions.length} correct ({percentage}%)</p>
    </div>
  )
}
```

## 👤 User Preferences Store (`useUserPreferences`)

Manages user settings and preferences with localStorage persistence.

### State Structure

```typescript
interface UserPreferencesState {
  // User journey
  isFirstVisit: boolean
  
  // Settings
  expertModeEnabled: boolean
  soundEnabled: boolean
  
  // History
  lastPlayedTopic?: string
  lastPlayedSubtopic?: string
  
  // Statistics
  totalGamesPlayed: number
  bestScore: number
}
```

### Persistence Configuration

```typescript
export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'quiz-user-preferences',
      partialize: (state) => ({
        // Only persist specific fields
        isFirstVisit: state.isFirstVisit,
        expertModeEnabled: state.expertModeEnabled,
        soundEnabled: state.soundEnabled,
        lastPlayedTopic: state.lastPlayedTopic,
        lastPlayedSubtopic: state.lastPlayedSubtopic,
        totalGamesPlayed: state.totalGamesPlayed,
        bestScore: state.bestScore,
      }),
    }
  )
)
```

### Analytics Integration

```typescript
setExpertModeEnabled: (enabled) => {
  set({ expertModeEnabled: enabled })
  // Sync with analytics
  setUserProperties({ expert_mode_enabled: enabled })
},

incrementGamesPlayed: () => {
  const newCount = get().totalGamesPlayed + 1
  set({ totalGamesPlayed: newCount })
  setUserProperties({ total_games_played: newCount })
}
```

### Usage Patterns

**First Visit Detection:**
```typescript
const HomePage = () => {
  const { isFirstVisit, setFirstVisit } = useUserPreferences()
  
  useEffect(() => {
    if (isFirstVisit) {
      // Start first-visit quiz automatically
      startFirstVisitQuiz()
      setFirstVisit(false)
    }
  }, [isFirstVisit])
}
```

**Expert Mode Toggle:**
```typescript
const ExpertModeToggle = () => {
  const { expertModeEnabled, setExpertModeEnabled } = useUserPreferences()
  
  return (
    <button onClick={() => setExpertModeEnabled(!expertModeEnabled)}>
      {expertModeEnabled ? 'Disable' : 'Enable'} Expert Mode
    </button>
  )
}
```

## 📚 Subtopic Store (`useSubtopicStore`)

Manages topic availability data with intelligent caching.

### State Structure

```typescript
interface SubtopicStore {
  availability: Record<string, SubtopicAvailability>
  lastUpdated: number | null
  isLoading: boolean
  
  // Cache management
  isStale: () => boolean
  refreshAvailability: () => Promise<void>
  clearCache: () => void
}

interface SubtopicAvailability {
  questionCount: number
  hasQuestions: boolean
}
```

### Caching Strategy

```typescript
// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

isStale: () => {
  const { lastUpdated } = get()
  if (!lastUpdated) return true
  return Date.now() - lastUpdated > CACHE_DURATION
}
```

### Automatic Refresh Logic

```typescript
const TopicsPage = () => {
  const { availability, isStale, refreshAvailability } = useSubtopicStore()
  
  useEffect(() => {
    // Only refresh if cache is stale
    if (isStale()) {
      refreshAvailability()
    }
  }, [])
  
  // Use cached data immediately
  const availableTopics = topics.filter(topic => 
    topic.subtopics.some(subtopic => availability[subtopic.slug]?.hasQuestions)
  )
}
```

### Usage Patterns

**Topic Availability Display:**
```typescript
const TopicCard = ({ topic }: { topic: QuizTopic }) => {
  const { availability } = useSubtopicStore()
  
  const availableSubtopics = topic.quiz_subtopics?.filter(subtopic => 
    availability[subtopic.slug]?.hasQuestions
  ).length || 0
  
  return (
    <div>
      <h3>{topic.topicName}</h3>
      <p>
        {availableSubtopics > 0 ? (
          `${availableSubtopics} subtopics`
        ) : (
          <span className="text-orange-600">Coming Soon</span>
        )}
      </p>
    </div>
  )
}
```

## 🔄 Store Communication Patterns

### Cross-Store Dependencies

**Quiz Start Flow:**
```typescript
const startQuiz = async () => {
  // Get user preferences
  const { expertModeEnabled } = useUserPreferences.getState()
  
  // Configure quiz store
  const { setExpertMode, setQuestions, setGameStatus } = useQuizStore.getState()
  setExpertMode(expertModeEnabled)
  
  // Load questions and start
  const questions = await loadQuestions()
  setQuestions(questions)
  setGameStatus('playing')
}
```

**Quiz Completion Flow:**
```typescript
const completeQuiz = () => {
  // Get quiz results
  const { totalScore } = useQuizStore.getState()
  
  // Update user preferences
  const { incrementGamesPlayed, setBestScore } = useUserPreferences.getState()
  incrementGamesPlayed()
  setBestScore(totalScore)
}
```

### Store Selectors

**Optimized Selectors:**
```typescript
// Only subscribe to specific fields
const currentQuestion = useQuizStore(state => state.currentQuestion)
const totalScore = useQuizStore(state => state.totalScore)

// Derived state
const isQuizActive = useQuizStore(state => 
  state.gameStatus === 'playing' && state.questions.length > 0
)
```

## 🎯 Best Practices

### 1. Immutable Updates

```typescript
// Good: Immutable update
setSelectedAnswers: (questionIndex, answer) => 
  set((state) => ({
    selectedAnswers: { ...state.selectedAnswers, [questionIndex]: answer }
  }))

// Avoid: Direct mutation
setSelectedAnswers: (questionIndex, answer) => {
  state.selectedAnswers[questionIndex] = answer // ❌ Mutates state
}
```

### 2. Computed Values

```typescript
// Store computed values for performance
recordQuestionResult: (questionIndex, answer, points, isCorrect) => {
  // Calculate everything at once
  const newTotalScore = state.totalScore + points
  const newQuestionsCorrect = state.questionsCorrect + (isCorrect ? 1 : 0)
  const newPercentage = Math.round((newQuestionsCorrect / state.questions.length) * 100)
  
  set({
    totalScore: newTotalScore,
    questionsCorrect: newQuestionsCorrect,
    percentage: newPercentage
  })
}
```

### 3. Error Handling

```typescript
refreshAvailability: async () => {
  const { setLoading } = get()
  try {
    setLoading(true)
    const availability = await strapiClient.getSubtopicAvailability()
    setAvailability(availability)
  } catch (error) {
    console.error('Failed to refresh subtopic availability:', error)
    setLoading(false) // Reset loading state on error
  }
}
```

### 4. TypeScript Integration

```typescript
// Strongly typed store
interface QuizState {
  gameStatus: 'idle' | 'playing' | 'completed' // Union types
  selectedAnswers: Record<number, string>       // Index signatures
  questions: QuizQuestion[]                     // Imported types
}

// Type-safe actions
setGameStatus: (status: QuizState['gameStatus']) => void
```

### 5. Performance Optimization

```typescript
// Use selectors to prevent unnecessary re-renders
const QuizProgress = () => {
  // Only re-render when currentQuestion changes
  const currentQuestion = useQuizStore(state => state.currentQuestion)
  const totalQuestions = useQuizStore(state => state.questions.length)
  
  return <div>{currentQuestion + 1} / {totalQuestions}</div>
}
```

## 🔍 Debugging and DevTools

### Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware'

export const useQuizStore = create<QuizState>()(
  devtools(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'quiz-store', // Name in DevTools
    }
  )
)
```

### Store Inspection

```typescript
// Access store state outside components
const currentQuizState = useQuizStore.getState()
console.log('Current quiz:', currentQuizState)

// Subscribe to changes
const unsubscribe = useQuizStore.subscribe(
  (state) => state.totalScore,
  (totalScore) => console.log('Score updated:', totalScore)
)
```

This state management architecture provides a clean, performant, and maintainable solution for managing complex application state while maintaining excellent TypeScript support and developer experience.