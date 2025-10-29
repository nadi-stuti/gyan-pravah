# Quiz System Implementation

## 🎮 Quiz System Overview

The Gyan Pravah quiz system is a comprehensive, mobile-first implementation that provides an engaging and educational quiz experience. The system is built with React components, Zustand state management, and integrates with Strapi CMS for content delivery.

## 🏗️ System Architecture

```
Quiz System Components:
├── QuizGameLogic.tsx      # Core game orchestration
├── QuestionCard.tsx       # Question display and interaction
├── AnswerOptions.tsx      # Answer selection interface
├── GameHeader.tsx         # Progress and score display
├── ResultsCard.tsx        # Results presentation
└── SwipeableQuestionCard.tsx # Mobile gesture support
```

## 🎯 Core Game Logic (`QuizGameLogic.tsx`)

The `QuizGameLogic` component orchestrates the entire quiz experience.

### State Management Integration

```typescript
const {
  currentQuestion,
  selectedAnswers,
  timeRemaining,
  totalScore,
  pointsPerQuestion,
  setCurrentQuestion,
  setTimeRemaining,
  setQuizMode,
  setQuizConfig,
  recordQuestionResult
} = useQuizStore()
```

**Key Features:**
- **Real-time scoring** - Points calculated and stored immediately
- **Progress tracking** - Current question and completion status
- **Timer management** - Per-question countdown with reading period
- **Answer recording** - Complete answer history with timestamps

### Quiz Configuration System

```typescript
const config = getQuizConfig(quizMode)

// Quiz modes available:
// - 'quizup': 7 questions (default)
// - 'quick': 5 questions
// - 'marathon': 15 questions  
// - 'first-visit': 3 easy questions

useEffect(() => {
  setQuizMode(quizMode)
  const maxScore = calculateMaxScore(config)
  setQuizConfig(maxScore)
}, [quizMode])
```

**Configuration Features:**
- **Flexible quiz lengths** - Different modes for different contexts
- **Scoring systems** - Mode-specific point calculations
- **Time limits** - Configurable per-question timing
- **Bonus rounds** - Special scoring for advanced questions

### Reading Period Implementation

```typescript
const [isReadingPeriod, setIsReadingPeriod] = useState(true)

useEffect(() => {
  setIsReadingPeriod(true)
  // Reading period ends after 3 seconds
  const readingTimer = setTimeout(() => {
    setIsReadingPeriod(false)
  }, 3000)
  
  return () => clearTimeout(readingTimer)
}, [currentQuestion])
```

**Reading Period Benefits:**
- **Comprehension time** - Users can read questions without time pressure
- **Reduced anxiety** - No immediate timer pressure
- **Better accuracy** - More thoughtful answers
- **Accessibility** - Accommodates different reading speeds

### Answer Processing

```typescript
const handleAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
  if (isAnswered || isReadingPeriod) return

  const currentQ = questions[currentQuestion]
  const isCorrect = answer === currentQ.correctOption
  const points = isCorrect ? calculatePoints(timeRemaining, currentQuestion) : 0
  const timeTaken = config.questionTimeLimit - timeRemaining
  const isBonus = isBonusRound(currentQuestion, config)
  
  // Track question answer for analytics
  trackEvent('question_answered', {
    question_id: currentQ.id,
    question_number: currentQuestion + 1,
    selected_answer: answer,
    correct_answer: currentQ.correctOption,
    is_correct: isCorrect,
    time_taken: timeTaken,
    time_remaining: timeRemaining,
    points_earned: points,
    difficulty: currentQ.difficulty,
    topic: currentQ.quiz_subtopic?.quiz_topic?.slug || 'unknown',
    subtopic: currentQ.quiz_subtopic?.slug,
    is_bonus_round: isBonus
  })
  
  // Record the complete question result in store
  recordQuestionResult(currentQuestion, answer, points, isCorrect)
  setIsAnswered(true)
  setShowFeedback(true)
  
  setTimeout(() => {
    progressToNextQuestion()
  }, config.feedbackDuration)
}, [/* dependencies */])
```

**Answer Processing Features:**
- **Immediate feedback** - Visual confirmation of selection
- **Point calculation** - Time-based scoring with bonuses
- **Analytics tracking** - Detailed performance metrics
- **State persistence** - All data stored in Zustand
- **Progress management** - Automatic advancement to next question

### Scoring System

```typescript
const calculatePoints = useCallback((remainingTime: number, questionIndex: number): number => {
  const isBonus = isBonusRound(questionIndex, config)
  return calculateQuestionPoints(true, remainingTime, isBonus, config)
}, [config])

// From quiz-config.ts
export function calculateQuestionPoints(
  isCorrect: boolean,
  timeRemaining: number,
  isBonusRound: boolean,
  config: QuizConfig
): number {
  if (!isCorrect) return 0
  
  const basePoints = isBonusRound ? config.maxPointsPerBonusQuestion : config.maxPointsPerNormalQuestion
  const timeBonus = Math.floor((timeRemaining / config.questionTimeLimit) * basePoints * 0.5)
  
  return basePoints + timeBonus
}
```

**Scoring Features:**
- **Base points** - Fixed points for correct answers
- **Time bonus** - Additional points for quick answers
- **Bonus rounds** - Double points for advanced questions
- **Progressive difficulty** - Higher stakes in later questions

## 📝 Question Display (`QuestionCard.tsx`)

The `QuestionCard` component handles question presentation and user interaction.

### Shuffled Answer Options

```typescript
const [shuffledOptions, setShuffledOptions] = useState<Array<{key: 'A' | 'B' | 'C' | 'D', text: string}>>([])

useEffect(() => {
  const options = Object.entries(question.options).map(([key, text]) => ({
    key: key as 'A' | 'B' | 'C' | 'D',
    text
  }))
  
  // Fisher-Yates shuffle algorithm
  const shuffled = [...options]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  setShuffledOptions(shuffled)
}, [question.id, question.options])
```

**Shuffling Benefits:**
- **Prevents pattern recognition** - Users can't memorize answer positions
- **Reduces bias** - No positional preference effects
- **Increases difficulty** - Requires actual knowledge, not patterns
- **Better assessment** - More accurate skill measurement

### Visual Timer System

```typescript
{!showOptions ? (
  // Reading timer (3 seconds)
  <div className="text-center">
    <motion.div
      key={readingTime}
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#8B7FC8] text-white text-xl sm:text-2xl font-bold mb-2"
    >
      {readingTime}
    </motion.div>
    <p className="text-sm text-gray-600 font-poppins">
      Read the question carefully...
    </p>
  </div>
) : (
  // Main quiz timer
  <div className="relative">
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${questionNumber > 6 ? 'bg-orange-500' : 'bg-green-500'}`}
        initial={{ width: '100%' }}
        animate={{ width: `${(timeRemaining / maxTime) * 100}%` }}
        transition={{ duration: 1, ease: "linear" }}
      />
    </div>
  </div>
)}
```

**Timer Features:**
- **Dual-phase timing** - Reading period + answer period
- **Visual progress bar** - Clear time remaining indication
- **Color coding** - Different colors for bonus rounds
- **Smooth animations** - Engaging visual feedback

### Category and Difficulty Display

```typescript
<span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: questionNumber > 6 ? '#F59E0B' : '#FBBF24' }}>
  {questionNumber > 6 ? '🎯 BONUS ROUND' : (question.quiz_subtopic?.quiz_topic?.topicName || 'General Knowledge')}
</span>
```

**Visual Indicators:**
- **Topic badges** - Clear category identification
- **Bonus round highlighting** - Special styling for bonus questions
- **Cultural color coding** - Topic-specific color schemes
- **Emoji indicators** - Visual cues for different question types

## 🎯 Answer Selection (`AnswerOptions.tsx`)

The answer selection system provides immediate feedback and visual states.

### Answer State Management

```typescript
const getOptionState = () => {
  if (isWrong) return 'wrong'
  if (isCorrect) return 'correct'
  if (isSelected) return 'selected'
  return 'default'
}

const getStateClasses = () => {
  switch (optionState) {
    case 'correct':
      return 'border-green-400 bg-green-400 text-white'
    case 'wrong':
      return 'border-red-400 bg-red-400 text-white'
    case 'selected':
      return 'border-[#8B7FC8] bg-[#8B7FC8] text-white'
    default:
      return 'border-gray-200 bg-white text-gray-900 hover:border-[#B4A5E8] hover:bg-[#B4A5E8] hover:text-white'
  }
}
```

**Visual States:**
- **Default** - Clean white background with subtle hover
- **Selected** - Primary purple background
- **Correct** - Green background with checkmark
- **Wrong** - Red background with X mark
- **Disabled** - Reduced opacity during feedback

### Touch-Friendly Design

```typescript
<motion.button
  className={`
    w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-150 text-left
    font-poppins font-medium text-sm sm:text-base min-h-touch
    disabled:cursor-not-allowed transform touch-manipulation
    ${getStateClasses()}
  `}
  role="button"
  aria-pressed={isSelected}
  aria-disabled={isDisabled}
>
```

**Mobile Optimizations:**
- **Minimum touch targets** - 44px minimum height
- **Touch manipulation** - Optimized for touch devices
- **Proper spacing** - Adequate gaps between options
- **Accessibility** - ARIA attributes for screen readers

## 🎊 Feedback System

### Score Feedback Animation

```typescript
function ScoreFeedback({ isCorrect, points, timeBonus }: ScoreFeedbackProps) {
  const isBonusQuestion = timeBonus > 0 && points > 20
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(139, 127, 200, 0.8)' }}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: -50 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          p-8 rounded-3xl text-center max-w-sm mx-4 shadow-2xl
          ${isCorrect 
            ? isBonusQuestion ? 'bg-orange-500' : 'bg-green-500'
            : 'bg-red-500'
          }
        `}
      >
        {/* Emoji and feedback content */}
      </motion.div>
    </motion.div>
  )
}
```

**Feedback Features:**
- **Full-screen overlay** - Immersive feedback experience
- **Spring animations** - Engaging entrance and exit
- **Contextual colors** - Different colors for different outcomes
- **Point display** - Clear indication of points earned
- **Bonus indicators** - Special treatment for bonus rounds

## 📊 Progress Tracking

### Game Header Component

```typescript
<GameHeader
  currentQuestion={currentQuestion}
  totalQuestions={questions.length}
  score={totalScore}
/>
```

**Progress Elements:**
- **Question counter** - "3 of 7" style display
- **Progress bar** - Visual completion indicator
- **Current score** - Real-time score updates
- **Bonus round indicators** - Special styling for bonus questions

### Real-time Score Updates

```typescript
// In QuizGameLogic
recordQuestionResult(currentQuestion, answer, points, isCorrect)

// In useQuizStore
recordQuestionResult: (questionIndex, answer, points, isCorrect) => {
  const state = get()
  const newTotalScore = state.totalScore + points
  const newQuestionsCorrect = state.questionsCorrect + (isCorrect ? 1 : 0)
  const newPercentage = Math.round((newQuestionsCorrect / state.questions.length) * 100)
  
  set({
    selectedAnswers: { ...state.selectedAnswers, [questionIndex]: answer },
    pointsPerQuestion: { ...state.pointsPerQuestion, [questionIndex]: points },
    totalScore: newTotalScore,
    questionsCorrect: newQuestionsCorrect,
    percentage: newPercentage
  })
}
```

**Real-time Features:**
- **Immediate updates** - Score updates as soon as answer is selected
- **Percentage calculation** - Live accuracy tracking
- **Question-by-question breakdown** - Detailed performance data
- **Persistent state** - All data maintained in Zustand store

## 🎮 Quiz Completion Flow

### Completion Detection

```typescript
const progressToNextQuestion = useCallback(() => {
  const nextQuestionIndex = currentQuestion + 1
  
  if (nextQuestionIndex >= questions.length) {
    // Quiz complete - track completion
    trackEvent('quiz_completed', {
      final_score: totalScore,
      total_possible_score: calculateMaxScore(config),
      percentage: Math.round((totalScore / calculateMaxScore(config)) * 100),
      questions_answered: questions.length,
      questions_correct: questions.filter((q, i) => selectedAnswers[i] === q.correctOption).length,
      total_questions: questions.length,
      time_taken_total: Math.round((Date.now() - quizStartTime) / 1000),
      mode: quizMode,
      is_expert_mode: questions.some(q => q.difficulty === 'Hard')
    })
    
    onQuizComplete(totalScore, selectedAnswers)
    return
  }
  
  // Move to next question
  setCurrentQuestion(nextQuestionIndex)
  setTimeRemaining(config.questionTimeLimit)
  setIsAnswered(false)
  setShowFeedback(false)
}, [/* dependencies */])
```

**Completion Features:**
- **Automatic detection** - Triggers when all questions answered
- **Complete analytics** - Comprehensive performance tracking
- **State preservation** - All quiz data maintained for results
- **Smooth transition** - Seamless flow to results page

## 🎯 Quiz Modes and Difficulty

### Mode Configuration

```typescript
export const QUIZ_CONFIGS: Record<QuizMode, QuizConfig> = {
  'first-visit': {
    totalQuestions: 3,
    questionTimeLimit: 30,
    maxPointsPerNormalQuestion: 10,
    maxPointsPerBonusQuestion: 20,
    bonusRoundStart: 999, // No bonus rounds in first visit
    feedbackDuration: 2000
  },
  'quick': {
    totalQuestions: 5,
    questionTimeLimit: 20,
    maxPointsPerNormalQuestion: 15,
    maxPointsPerBonusQuestion: 30,
    bonusRoundStart: 4,
    feedbackDuration: 1500
  },
  'quizup': {
    totalQuestions: 7,
    questionTimeLimit: 20,
    maxPointsPerNormalQuestion: 20,
    maxPointsPerBonusQuestion: 40,
    bonusRoundStart: 6,
    feedbackDuration: 1500
  },
  'marathon': {
    totalQuestions: 15,
    questionTimeLimit: 15,
    maxPointsPerNormalQuestion: 25,
    maxPointsPerBonusQuestion: 50,
    bonusRoundStart: 10,
    feedbackDuration: 1000
  }
}
```

### Difficulty Progression

```typescript
// Question difficulty filtering based on mode
if (mode === 'first-visit') {
  params.append('filters[difficulty][$eq]', 'Easy')
} else if (mode === 'expert') {
  params.append('filters[difficulty][$in][0]', 'Medium')
  params.append('filters[difficulty][$in][1]', 'Hard')
} else {
  params.append('filters[difficulty][$in][0]', 'Easy')
  params.append('filters[difficulty][$in][1]', 'Medium')
}
```

**Difficulty Features:**
- **Progressive difficulty** - Easier questions first, harder later
- **Mode-specific filtering** - Appropriate difficulty for each mode
- **Expert mode** - Only medium and hard questions
- **First-visit mode** - Only easy questions for introduction

This comprehensive quiz system provides an engaging, educational, and technically robust foundation for the Gyan Pravah application, with excellent mobile experience, real-time feedback, and detailed analytics tracking.