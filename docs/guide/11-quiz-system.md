# Quiz System Implementation

## 🎮 Quiz System Overview

The Gyan Pravah quiz system is a comprehensive, mobile-first implementation that provides an engaging and educational quiz experience. The system is built with React components, Zustand state management, and integrates with Strapi CMS for content delivery.

**📊 For detailed scoring rules and point calculations, see [Scoring System Documentation](./12-scoring-system.md)**

## 🏗️ System Architecture

```
Quiz System Components:
├── QuizGameLogic.tsx      # Core game orchestration
├── QuestionCard.tsx       # Question display and interaction
├── AnswerOptions.tsx      # Answer selection interface
├── GameHeader.tsx         # Progress and score display
└── ResultsCard.tsx        # Results presentation
```

**Note:** The system has been simplified to remove unnecessary complexity. SwipeableQuestionCard and other wrapper components have been removed in favor of direct, straightforward implementations.

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
- **Reaction time tracking** - Average speed displayed as temperature meter
- **Results visualization** - Single-line quiz summary pill with color-coded performance

### Quiz Configuration System

```typescript
const config = getQuizConfig(quizMode)

// Quiz modes available:
// - 'quizup': 7 questions (default)
// - 'quick': 5 questions
// - 'marathon': 15 questions  
// - 'first-visit': 7 easy questions

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
  
  // Record reaction time for temperature meter
  recordReactionTime(timeTaken)
  
  setIsAnswered(true)
  
  // v2.2: Different feedback for correct vs wrong answers
  if (isCorrect) {
    setShowFeedback(true) // Show popup with points breakdown
  }
  // For wrong answers: No popup, correct answer shown on QuestionCard component
  // QuestionCard handles showing correct/wrong states when isAnswered=true
  
  setTimeout(() => {
    progressToNextQuestion()
  }, 2500) // 2.5 seconds for both correct and wrong answers
}, [/* dependencies */])
```

**Answer Processing Features:**
- **Immediate feedback** - Visual confirmation of selection
- **Point calculation** - Time-based scoring with bonuses
- **Analytics tracking** - Detailed performance metrics
- **State persistence** - All data stored in Zustand
- **Progress management** - Automatic advancement to next question
- **Reaction time tracking** - Records time taken for each question
- **Wrong answer handling** - Shows correct answer on card (no popup for wrong answers)

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

  // Scoring thresholds
  const SUPER_FAST_THRESHOLD = 8  // 8-10 seconds
  const FAST_THRESHOLD = 3        // 3-7 seconds
  
  let points = 0
  
  if (timeRemaining >= SUPER_FAST_THRESHOLD) {
    // Super Fast: 10 + 5 + 5 = 20 points
    points = 20
  } else if (timeRemaining >= FAST_THRESHOLD) {
    // Fast: 10 + (seconds above threshold)
    points = 10 + (timeRemaining - FAST_THRESHOLD)
  } else {
    // Late: 5 points only
    points = 5
  }
  
  // Double for bonus rounds
  if (isBonusRound) {
    points *= 2
  }
  
  return points
}
```

**Scoring Features:**
- **Super Fast (8-10s)** - 20 points (10 base + 5 fast + 5 super fast bonus)
- **Fast (3-7s)** - 10-15 points (10 base + 1 per second above threshold)
- **Late (0-2s)** - 5 points (fixed, no bonuses)
- **Bonus rounds** - 2x multiplier on all points
- **Visual feedback** - Detailed breakdown showing all point components

**See:** `docs/12-scoring-system.md` for complete scoring documentation

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
  {questionNumber > 6 ? '🎯 BONUS ROUND' : (question.quiz_subtopic?.name || question.quiz_subtopic?.quiz_topic?.topicName || 'General Knowledge')}
</span>
```

**Visual Indicators:**
- **Topic badges** - Shows subtopic name (fixed in v2.2)
- **Bonus round highlighting** - Special styling for bonus questions
- **Cultural color coding** - Topic-specific color schemes
- **Emoji indicators** - Visual cues for different question types
- **Proper fallback chain** - Subtopic → Topic → General Knowledge

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

## 🎊 Feedback System (v2.2)

### Score Feedback Animation

**v2.2 Behavior:**
- **Correct Answers:** Show popup with detailed point breakdown
- **Wrong Answers:** Show correct answer on QuestionCard (no popup)

```typescript
function ScoreFeedback({ isCorrect, points, timeRemaining, isBonusRound }: ScoreFeedbackProps) {
  // Wrong answers show simple "Oops!" message
  if (!isCorrect) {
    return (
      <motion.div className="fixed inset-0 flex items-center justify-center z-50 px-4"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
        <motion.div className="bg-red-500 rounded-3xl p-8 text-center max-w-sm w-full">
          <div className="text-7xl mb-3">😔</div>
          <h3 className="text-2xl font-bold text-white mb-2">Oops!</h3>
          <p className="text-white opacity-90">Better luck next time</p>
        </motion.div>
      </motion.div>
    )
  }

  // Correct answers show detailed breakdown
  const isSuperFast = timeRemaining >= 8
  const isFast = timeRemaining >= 3 && timeRemaining < 8
  const isLate = timeRemaining < 3
  
  let emoji = isSuperFast ? '🚀' : isFast ? '✨' : '✓'
  let message = isSuperFast ? 'Amazing!' : isFast ? 'Great Job!' : 'Correct!'
  let bgColor = isSuperFast ? 'bg-yellow-400' : isFast ? 'bg-green-500' : 'bg-gray-500'
  
  return (
    <motion.div className="fixed inset-0 flex items-center justify-center z-50 px-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <motion.div className={`${bgColor} rounded-3xl p-8 text-center max-w-sm w-full`}>
        <div className="text-7xl mb-3">{emoji}</div>
        <h3 className="text-3xl font-bold text-white mb-4">{message}</h3>
        
        {/* Speed badges */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {isSuperFast && (
            <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              ⚡ Super Fast
            </div>
          )}
          {isFast && (
            <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              💨 Fast Answer
            </div>
          )}
          {isBonusRound && (
            <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              🎯 Bonus x2
            </div>
          )}
        </div>
        
        {/* Points display */}
        <div className="text-6xl font-bold text-white mb-2">+{points}</div>
        <p className="text-sm text-white opacity-75">points earned</p>
      </motion.div>
    </motion.div>
  )
}
```

**v2.2 Feedback Features:**
- **Correct answers:** Full-screen popup with detailed breakdown
  - Speed category badges (Super Fast, Fast, or none for Late)
  - Bonus round indicator if applicable
  - Large point display with animation
  - Contextual emoji and message
- **Wrong answers:** Simple "Oops!" popup
  - No point breakdown (0 points)
  - Correct answer shown on QuestionCard component
  - Shorter, simpler feedback
- **Full-screen overlay** - Immersive feedback experience
- **Spring animations** - Engaging entrance and exit
- **Contextual colors** - Yellow (super fast), Green (fast), Gray (late), Red (wrong)

## 📊 Progress Tracking

### Game Header Component

```typescript
<GameHeader
  currentQuestion={currentQuestion}
  totalQuestions={questions.length}
  score={totalScore}
  averageReactionTime={averageReactionTime}
/>
```

**Progress Elements:**
- **Question counter** - "3 of 7" style display
- **Progress bar** - Visual completion indicator
- **Current score** - Real-time score updates
- **Temperature meter** - Replaces percentage, shows average reaction time
  - 🔥 Hot (<3s): "Lightning Fast!" - Red
  - 🌡️ Warm (3-5s): "Great Speed" - Orange
  - ❄️ Cool (5-7s): "Good Pace" - Blue
  - 🧊 Cold (>7s): "Take Your Time" - Dark Blue
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

## 📊 Results Screen

### Average Reaction Time Display

The results screen now displays average reaction time above the accuracy percentage:

```typescript
<div className="text-center mb-4">
  <div className="text-sm text-gray-600 mb-1">Average Reaction Time</div>
  <div className="text-2xl font-bold text-purple-600">
    {averageReactionTime.toFixed(1)}s
  </div>
  <div className="text-xs text-gray-500">
    {averageReactionTime < 3 ? '🔥 Lightning Fast!' : 
     averageReactionTime < 5 ? '🌡️ Great Speed' :
     averageReactionTime < 7 ? '❄️ Good Pace' : '🧊 Take Your Time'}
  </div>
</div>
```

### Quiz Summary Pill

The results screen features a single-line quiz summary that shows performance at a glance:

```typescript
// Visual representation
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│🔥 1│ │✨ 2│ │❌ 3│ │✨ 4│ │🔥 5│ │⏱️ 6│ │🔥 7│  →
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘
```

**Features:**
- Single horizontal line (never wraps)
- Color-coded pills for each question
- Icons indicate performance category
- Horizontal scrollable for many questions
- Touch-friendly on mobile

**Color Codes:**
- 🔥 Super Fast: `bg-yellow-400` (#FBBF24)
- ✨ Fast: `bg-green-400` (#4ADE80)
- ⏱️ Late: `bg-gray-400` (#9CA3AF)
- ❌ Wrong: `bg-red-400` (#EF4444)
- ⊘ Skipped: `bg-gray-600` (#6B7280)

**Implementation:**
```typescript
<div className="w-full overflow-x-auto py-2">
  <div className="flex gap-2 flex-nowrap min-w-max justify-center">
    {questions.map((_, index) => {
      const status = getQuestionStatus(index)
      return (
        <div 
          key={index}
          className={`${status.color} ${status.textColor} px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-1`}
          title={`Q${index + 1}: ${status.label}`}
        >
          <span>{status.icon}</span>
          <span>{index + 1}</span>
        </div>
      )
    })}
  </div>
</div>
```

### Paginated Review Cards

Questions are reviewed one at a time with navigation buttons:

```typescript
<div className="space-y-4">
  {/* Question Counter */}
  <div className="text-center text-white mb-4 text-sm">
    Question {currentReviewIndex + 1} of {questions.length}
  </div>
  
  {/* Single Question Card */}
  <ReviewQuestionCard 
    question={questions[currentReviewIndex]}
    index={currentReviewIndex}
    userAnswer={selectedAnswers[currentReviewIndex]}
    earnedPoints={pointsPerQuestion[currentReviewIndex]}
    reactionTime={reactionTimes[currentReviewIndex]}
    isBonus={isBonusRound(currentReviewIndex, config)}
  />
  
  {/* Navigation Buttons */}
  <div className="flex justify-between mt-6 gap-4">
    <button
      onClick={() => setCurrentReviewIndex(prev => Math.max(0, prev - 1))}
      disabled={currentReviewIndex === 0}
      className="flex-1 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold disabled:opacity-50"
    >
      ← Previous
    </button>
    <button
      onClick={() => setCurrentReviewIndex(prev => Math.min(questions.length - 1, prev + 1))}
      disabled={currentReviewIndex === questions.length - 1}
      className="flex-1 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold disabled:opacity-50"
    >
      Next →
    </button>
  </div>
</div>
```

### Detailed Scoring Breakdown

Each review card shows the complete scoring calculation:

```typescript
{isCorrect ? (
  <div className="bg-gray-50 rounded-xl p-4">
    <h4 className="font-semibold text-gray-900 mb-3">Scoring Breakdown</h4>
    
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Time Remaining:</span>
        <span className="font-semibold">{timeRemaining.toFixed(1)}s</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Category:</span>
        <span className="font-semibold">
          {timeRemaining >= 8 ? '🔥 Super Fast' : 
           timeRemaining >= 3 ? '✨ Fast' : '⏱️ Late'}
        </span>
      </div>
      
      <div className="border-t pt-2 mt-2 space-y-1">
        {/* Point breakdown based on category */}
        {timeRemaining >= 8 && (
          <>
            <div className="flex justify-between text-gray-700">
              <span>Base Points:</span>
              <span>+10</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Fast Bonus:</span>
              <span>+5</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Super Fast Bonus:</span>
              <span>+5</span>
            </div>
          </>
        )}
        
        {isBonus && (
          <div className="flex justify-between text-purple-600 font-semibold">
            <span>Bonus Round Multiplier:</span>
            <span>×2</span>
          </div>
        )}
      </div>
      
      <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
        <span>Total Points:</span>
        <span className="text-purple-600">+{earnedPoints}</span>
      </div>
    </div>
  </div>
) : (
  <div className="bg-gray-50 rounded-xl p-4">
    <h4 className="font-semibold text-gray-900 mb-2">Scoring Breakdown</h4>
    <div className="text-gray-600">
      ❌ Incorrect answer: 0 points
    </div>
  </div>
)}
```

### Action Buttons

Four action buttons provide different navigation options:

```typescript
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
  <button onClick={handleReplaySame} className="bg-green-400 hover:bg-green-500 text-white font-bold py-3 px-3 sm:px-4 rounded-xl">
    <span className="block sm:hidden">🔄</span>
    <span className="hidden sm:block">🔄 Play Again</span>
  </button>

  <button onClick={handleReplayExpert} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-3 sm:px-4 rounded-xl">
    <span className="block sm:hidden">⚡</span>
    <span className="hidden sm:block">⚡ {isExpertMode ? 'Normal' : 'Expert'}</span>
  </button>

  <button onClick={handleChooseTopic} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-3 sm:px-4 rounded-xl">
    <span className="block sm:hidden">📖</span>
    <span className="hidden sm:block">📖 Topics</span>
  </button>

  <button onClick={handleGoHome} className="bg-white hover:bg-gray-50 text-gray-900 font-bold py-3 px-3 sm:px-4 rounded-xl border-2 border-gray-200">
    <span className="block sm:hidden">🏠</span>
    <span className="hidden sm:block">🏠 Home</span>
  </button>
</div>
```

**Button Functions:**
- **Play Again** - Reloads questions based on quiz source (random/topic), maintains expert mode
- **Expert/Normal Toggle** - Switches difficulty mode and reloads questions
- **Choose Topic** - Navigates to topic selection page
- **Go to Home** - Returns to home page

**Responsive Layout:**
- Mobile: 2x2 grid with icon-only buttons
- Desktop: 1x4 grid (single row) with full text labels

This comprehensive quiz system provides an engaging, educational, and technically robust foundation for the Gyan Pravah application, with excellent mobile experience, real-time feedback, detailed analytics tracking, clear results visualization, and comprehensive replay functionality.