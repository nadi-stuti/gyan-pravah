# Component Architecture

## 🏗️ Architecture Overview

The Gyan Pravah application follows a **server-first component architecture** with clear separation between server and client components. Server components handle data fetching and static rendering, while client components provide interactivity. The architecture is designed for performance, maintainability, and optimal user experience.

### Server vs Client Components

**Server Components (Default):**
- Topic and subtopic pages
- Data fetching and caching
- Static content rendering
- No JavaScript sent to client

**Client Components ('use client'):**
- Quiz game logic and interactions
- Animations and transitions
- User input handling
- Real-time state updates

## 📁 Component Organization

```
components/
├── ui/                     # Reusable UI components (design system)
│   ├── Button.tsx         # Primary button component
│   ├── Card.tsx           # Card container component
│   ├── Timer.tsx          # Quiz timer component
│   └── index.ts           # Barrel exports
├── quiz/                  # Quiz-specific components (client)
│   ├── QuestionCard.tsx   # Individual question display
│   ├── AnswerOptions.tsx  # Answer selection interface
│   ├── QuizGame.tsx       # Main quiz game component
│   ├── QuizGameLogic.tsx  # Core quiz logic
│   └── index.ts           # Barrel exports
├── topics/                # Topic display components
│   ├── TopicGrid.tsx      # Topic grid display (client)
│   ├── SubtopicsClient.tsx # Subtopic selection (client)
│   └── index.ts           # Barrel exports
├── home/                  # Home page components
│   ├── PlayNowButton.tsx  # Quick start button
│   └── ExpertModeToggle.tsx # Difficulty toggle
└── providers/             # Context providers
    └── PHProvider.tsx     # PostHog analytics provider
```

## 🎨 Design System Components

### Button Component

The `Button` component is the foundation of all interactive elements:

```typescript
interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}
```

**Key Features:**
- **Variant System** - Consistent styling across different button types
- **Size System** - Touch-friendly sizing for mobile devices
- **Loading States** - Built-in loading spinner and disabled state
- **Accessibility** - Proper ARIA attributes and keyboard navigation
- **Animation** - Smooth hover and tap feedback

**Design System Compliance:**
```typescript
const variantClasses = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600', // Solid colors only
  secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
  // No gradients - follows design system rules
}
```

**Mobile Optimizations:**
```typescript
const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-touch',        // 44px minimum
  md: 'px-4 py-3 text-base min-h-touch-lg',   // 48px minimum
  lg: 'px-6 py-4 text-lg min-h-touch-lg'      // 52px minimum
}
```

### Card Component

The `Card` component provides consistent container styling:

```typescript
interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  animate?: boolean
  onClick?: () => void
  hoverable?: boolean
}
```

**Design Features:**
- **Flat Design** - No shadows, clean borders
- **Rounded Corners** - Consistent `rounded-2xl` (16px)
- **White Background** - Always `bg-background-card`
- **Responsive Padding** - Mobile-first spacing

**Animation Integration:**
```typescript
<motion.div
  variants={getAccessibleVariants(cardAnimationVariants)}
  initial="initial"
  animate="animate"
  whileHover={hoverable ? "hover" : undefined}
  whileTap={onClick ? "tap" : undefined}
>
```

## 🎮 Quiz Components

### QuizGameLogic Component

The core quiz component that orchestrates the entire quiz experience:

```typescript
interface QuizGameLogicProps {
  questions: QuizQuestion[]
  onQuizComplete: (score: number, answers: Record<number, string>) => void
  quizMode: 'quizup' | 'quick' | 'marathon' | 'first-visit'
  className?: string
}
```

**Responsibilities:**
- **State Management** - Current question, answers, score, timer, reaction times
- **Game Flow** - Question progression, completion logic
- **Scoring System** - Time-based point calculation with speed bonuses
- **Reaction Time Tracking** - Records time taken for each question
- **Animation Coordination** - Question transitions and feedback

### Results Page Components (v2.2)

**QuizSummaryPill Component** ✅
- Displays all questions in single horizontal line
- Color-coded pills for each question:
  - 🔥 Super Fast (Yellow #FBBF24)
  - ✨ Fast (Green #4ADE80)
  - ⏱️ Late (Gray #9CA3AF)
  - ❌ Wrong (Red #EF4444)
  - ⊘ Skipped (Dark Gray #6B7280)
- Horizontal scrollable for quizzes with many questions
- Each pill shows icon + question number
- Never wraps to multiple lines
- Touch-friendly on mobile

**Average Reaction Time Display** ✅
- Shows average time above accuracy percentage
- Temperature indicator (🔥/🌡️/❄️/🧊)
- Real-time calculation from reaction times array

**Paginated Review Cards** ✅
- One question at a time with Previous/Next buttons
- Question counter (e.g., "Question 3 of 7")
- Shows user's answer and correct answer
- Detailed scoring breakdown with math
- Explanation for each question

**Action Buttons** ✅
- 🔄 Play Again - Reloads questions based on quiz source
- ⚡ Expert/Normal Toggle - Switches mode and reloads
- 📖 Choose Topic - Navigates to topic selection
- 🏠 Go to Home - Returns to home page
- Responsive: 2x2 grid on mobile, 1x4 on desktop

**Key Implementation:**
```typescript
const handleAnswerSelect = (option: 'A' | 'B' | 'C' | 'D') => {
  const isCorrect = option === currentQuestion.correctOption
  const timeTaken = config.questionTimeLimit - timeRemaining
  
  // Calculate points based on time remaining
  // Super Fast (8-10s): 20 points
  // Fast (3-7s): 10-15 points
  // Late (0-2s): 5 points
  const points = isCorrect ? calculateQuestionPoints(true, timeRemaining, isBonusRound) : 0
  
  // Record complete question result
  recordQuestionResult(currentQuestionIndex, option, points, isCorrect)
  
  // Record reaction time for temperature meter
  recordReactionTime(timeTaken)
  
  // Show feedback only for correct answers
  if (isCorrect) {
    setShowFeedback(true)
  } else {
    // For wrong answers, show correct answer on card
    setShowCorrectAnswer(true)
  }
  
  setTimeout(() => moveToNextQuestion(), 2500)
}
```

### QuestionCard Component

Displays individual questions with animations and interactions:

```typescript
interface QuestionCardProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  onAnswerSelect: (option: 'A' | 'B' | 'C' | 'D') => void
  selectedAnswer?: 'A' | 'B' | 'C' | 'D'
  showFeedback?: boolean
  isCorrect?: boolean
  timeLeft: number
  maxTime: number
}
```

**Features:**
- **Swipeable Interface** - Touch gestures for mobile
- **Progress Indicator** - Visual progress through quiz
- **Timer Display** - Countdown with visual feedback
- **Answer Feedback** - Immediate correct/incorrect indication

**Animation Strategy:**
```typescript
<motion.div
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -50 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
```

### AnswerOptions Component

Handles answer selection with visual feedback:

```typescript
interface AnswerOptionsProps {
  options: Record<'A' | 'B' | 'C' | 'D', string>
  onSelect: (option: 'A' | 'B' | 'C' | 'D') => void
  selectedAnswer?: 'A' | 'B' | 'C' | 'D'
  correctAnswer?: 'A' | 'B' | 'C' | 'D'
  showFeedback?: boolean
  disabled?: boolean
}
```

**Visual States:**
- **Default** - White background, purple text
- **Selected** - Purple background, white text
- **Correct** - Green background (when feedback shown)
- **Incorrect** - Red background (when feedback shown)
- **Disabled** - Grayed out during feedback

## 🏠 Home Page Components

### PlayNowButton Component

The primary call-to-action for starting a quiz:

```typescript
const PlayNowButton = () => {
  const { isExpertMode } = useUserPreferences()
  const { setQuestions, setExpertMode, setGameStatus, resetQuiz } = useQuizStore()
  
  const handlePlayNow = async () => {
    // Track user action
    trackEvent('play_now_clicked', { mode: isExpertMode ? 'expert' : 'normal' })
    
    // Reset and configure quiz
    resetQuiz()
    setExpertMode(isExpertMode)
    
    // Load questions and start
    const questions = await strapiClient.getRandomQuestions(7, 'quizup')
    setQuestions(questions)
    setGameStatus('playing')
    
    router.push('/quiz')
  }
}
```

**Features:**
- **Expert Mode Integration** - Respects user preference
- **Loading States** - Shows loading during question fetch
- **Error Handling** - Graceful failure with retry options
- **Analytics Integration** - Tracks user interactions

### TopicGrid Component (Client)

Client component that receives topics from server component:

```typescript
'use client'

export function TopicGrid({ topics }: { topics: QuizTopic[] }) {
  const router = useRouter()
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {topics.map((topic, index) => (
        <motion.button
          key={topic.id}
          className="bg-white rounded-2xl p-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/topics/${topic.slug}`)}
        >
          <h3>{topic.topicName}</h3>
          <p>{topic.quiz_subtopics?.length || 0} subtopics</p>
        </motion.button>
      ))}
    </div>
  )
}
```

**Server Component Usage:**
```typescript
// app/topics/page.tsx (Server Component)
export default async function TopicsPage() {
  const topics = await getTopicsWithAvailability()
  return <TopicGrid topics={topics} />
}
```

## 🧭 Navigation Components

### NavigationHandler Component

Global navigation logic that handles browser back button and app navigation:

```typescript
const NavigationHandler = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { gameStatus, resetQuiz } = useQuizStore()
  
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Handle quiz exit confirmation
      if (pathname === '/quiz' && gameStatus === 'playing') {
        const shouldExit = confirm('Are you sure you want to exit the quiz?')
        if (!shouldExit) {
          event.preventDefault()
          window.history.pushState(null, '', pathname)
          return
        }
        resetQuiz()
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pathname, gameStatus])
}
```

### BackButton Component

Consistent back navigation with proper routing:

```typescript
interface BackButtonProps {
  to?: string
  fallback?: string
  className?: string
  onBack?: () => void
}

const BackButton = ({ to, fallback = '/', className, onBack }: BackButtonProps) => {
  const router = useRouter()
  
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (to) {
      router.push(to)
    } else if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }
  
  return (
    <motion.button
      onClick={handleBack}
      className={`p-3 rounded-xl bg-white text-[#8B7FC8] shadow-md ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeftIcon />
    </motion.button>
  )
}
```

## 🎨 Layout Components

### ClientLayout Component

Wraps all pages with client-side functionality:

```typescript
const ClientLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  
  // Global page view tracking
  useEffect(() => {
    const pageName = pathname === '/' ? 'home' : pathname.slice(1).split('/')[0]
    trackPageView(pageName as ValidPage)
  }, [pathname])
  
  // Page transition animations
  const pageVariants = getPageVariants(pathname)
  
  return (
    <>
      <NavigationHandler />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
```

**Features:**
- **Global Analytics** - Automatic page view tracking
- **Page Transitions** - Smooth animations between routes
- **Navigation Handling** - Browser back button management
- **Error Boundaries** - Global error catching

## 🔄 Component Communication Patterns

### Props Down, Events Up

```typescript
// Parent component
const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  
  return (
    <QuestionCard
      question={questions[currentQuestion]}
      onAnswerSelect={(answer) => {
        // Handle answer selection
        setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: answer }))
        setCurrentQuestion(prev => prev + 1)
      }}
    />
  )
}
```

### Zustand Store Integration

```typescript
// Component using store
const QuizComponent = () => {
  const {
    questions,
    selectedAnswers,
    setSelectedAnswers,
    totalScore,
    incrementScore
  } = useQuizStore()
  
  // Component logic uses store state and actions
}
```

### Context for Theme/Settings

```typescript
// Theme context (if needed)
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
})

// Component using context
const ThemedComponent = () => {
  const { theme } = useContext(ThemeContext)
  return <div className={`theme-${theme}`}>Content</div>
}
```

## 📱 Mobile-First Component Design

### Touch-Friendly Interfaces

```typescript
// Minimum touch target sizes
const touchClasses = {
  small: 'min-h-touch',      // 44px
  medium: 'min-h-touch-lg',  // 48px
  large: 'min-h-touch-xl'    // 52px
}

// Touch optimization
className="touch-manipulation" // Improves touch responsiveness
```

### Responsive Design Patterns

```typescript
// Mobile-first responsive classes
className="text-sm sm:text-base md:text-lg"  // Typography
className="p-3 sm:p-4 md:p-6"               // Spacing
className="grid-cols-1 sm:grid-cols-2"      // Layout
```

### Gesture Support

```typescript
// Swipe gestures for quiz navigation
const handleSwipe = useSwipeable({
  onSwipedLeft: () => nextQuestion(),
  onSwipedRight: () => previousQuestion(),
  preventDefaultTouchmoveEvent: true,
  trackMouse: true
})
```

## 🎯 Component Best Practices

### 1. Single Responsibility Principle
Each component has one clear purpose:
- `Button` - Interactive element
- `Card` - Content container
- `QuestionCard` - Question display
- `AnswerOptions` - Answer selection

### 2. Composition Over Inheritance
```typescript
// Good: Composition
<Card>
  <Button variant="primary">Click me</Button>
</Card>

// Avoid: Complex inheritance hierarchies
```

### 3. Props Interface Design
```typescript
// Clear, typed interfaces
interface ComponentProps {
  // Required props first
  data: DataType
  onAction: (value: string) => void
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary'
  className?: string
  disabled?: boolean
}
```

### 4. Error Boundaries
```typescript
// Wrap components that might fail
<ErrorBoundary fallback={<ErrorFallback />}>
  <DataDependentComponent />
</ErrorBoundary>
```

### 5. Loading States
```typescript
// Always handle loading states
if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorMessage error={error} />
return <ActualContent data={data} />
```

This component architecture provides a solid foundation for building maintainable, scalable, and user-friendly React applications with excellent mobile experience and consistent design system compliance.