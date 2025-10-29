# Quiz Components

## 🎮 Quiz Component System

The quiz components form the core interactive experience of the Gyan Pravah application. These specialized components handle question display, answer selection, progress tracking, and results presentation with sophisticated animations and mobile-optimized interactions.

## 🏗️ Component Architecture

### Quiz Component Hierarchy

```
Quiz System Components:
├── QuizGameLogic.tsx          # Core game orchestration
├── QuestionCard.tsx           # Question display with timer
├── AnswerOptions.tsx          # Answer selection interface
├── GameHeader.tsx             # Progress and score display
├── ResultsCard.tsx            # Individual question results
├── SwipeableQuestionCard.tsx  # Mobile gesture support
└── EnhancedQuizLoader.tsx     # Quiz loading states
```

## 🃏 QuestionCard Component

The QuestionCard is the centerpiece of the quiz experience, handling question display, timing, and answer shuffling.

### Core Features

**Reading Period System:**
```typescript
const [readingTime, setReadingTime] = useState(3)
const [showOptions, setShowOptions] = useState(false)

useEffect(() => {
  if (readingTime > 0) {
    const timer = setTimeout(() => {
      setReadingTime(prev => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  } else {
    setShowOptions(true)
  }
}, [readingTime])
```

**Benefits:**
- **Reduces anxiety** - Users can read without time pressure
- **Improves comprehension** - Better understanding of questions
- **Accessibility** - Accommodates different reading speeds
- **Fair gameplay** - Everyone gets equal reading time

### Answer Shuffling Algorithm

```typescript
// Fisher-Yates shuffle algorithm
const shuffled = [...options]
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
}
```

**Why Shuffling Matters:**
- **Prevents pattern recognition** - Users can't memorize positions
- **Reduces bias** - No positional preference effects
- **Increases difficulty** - Requires actual knowledge
- **Better assessment** - More accurate skill measurement

### Visual Timer Implementation

```typescript
{!showOptions ? (
  // Reading timer (3 seconds)
  <div className="text-center">
    <motion.div
      key={readingTime}
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B7FC8] text-white text-xl font-bold"
    >
      {readingTime}
    </motion.div>
    <p className="text-sm text-gray-600">Read the question carefully...</p>
  </div>
) : (
  // Main quiz timer
  <div className="relative">
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-green-500"
        initial={{ width: '100%' }}
        animate={{ width: `${(timeRemaining / maxTime) * 100}%` }}
        transition={{ duration: 1, ease: "linear" }}
      />
    </div>
  </div>
)}
```

### Category and Difficulty Display

```typescript
<span 
  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white"
  style={{ backgroundColor: questionNumber > 6 ? '#F59E0B' : '#FBBF24' }}
>
  {questionNumber > 6 ? '🎯 BONUS ROUND' : (question.quiz_subtopic?.quiz_topic?.topicName || 'General Knowledge')}
</span>
```

**Visual Indicators:**
- **Topic badges** - Clear category identification
- **Bonus round highlighting** - Special styling for bonus questions
- **Cultural color coding** - Topic-specific color schemes
- **Emoji indicators** - Visual cues for different question types

## 🎯 AnswerOptions Component

Handles answer selection with sophisticated visual feedback and state management.

### Answer State System

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
      return 'border-green-500 bg-green-500 text-white shadow-lg'
    case 'wrong':
      return 'border-red-500 bg-red-500 text-white shadow-lg'
    case 'selected':
      return 'border-purple-500 bg-purple-500 text-white shadow-lg'
    default:
      return 'border-gray-200 bg-white text-gray-900 hover:border-purple-300'
  }
}
```

### Interactive Animations

```typescript
const buttonVariants = {
  default: {
    scale: 1,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  tap: {
    scale: 0.98
  },
  correct: {
    scale: 1.02,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  wrong: {
    scale: 1,
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  }
}
```

### Option Circle Component

```typescript
function OptionCircle({ option, state, isSelected }: OptionCircleProps) {
  return (
    <motion.div
      animate={{
        scale: isSelected || state === 'correct' || state === 'wrong' ? 1.1 : 1,
        rotate: state === 'wrong' ? [0, -5, 5, -5, 0] : 0
      }}
      transition={{ 
        duration: state === 'wrong' ? 0.5 : 0.2,
        type: "spring",
        stiffness: 300
      }}
      className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
    >
      {option}
    </motion.div>
  )
}
```

**Animation Features:**
- **Scale feedback** - Visual confirmation of selection
- **Shake animation** - Wrong answers get subtle shake
- **Color transitions** - Smooth state changes
- **Spring physics** - Natural, bouncy animations

## 📊 GameHeader Component

Displays quiz progress, score, and round indicators with real-time updates.

### Round Indicator System

```typescript
const getRoundIndicators = () => {
  const indicators = []
  for (let i = 0; i < totalQuestions; i++) {
    let status: 'pending' | 'current' | 'completed' | 'correct' | 'incorrect' | 'skipped' = 'pending'
    const isBonus = i >= 6 // Questions 7+ are bonus rounds
    
    if (i < currentQuestion) {
      const userAnswer = selectedAnswers[i]
      const question = questions[i]
      
      if (!userAnswer) {
        status = 'skipped'
      } else if (userAnswer === question?.correctOption) {
        status = 'correct'
      } else {
        status = 'incorrect'
      }
    } else if (i === currentQuestion) {
      status = 'current'
    }
    
    // Color coding based on status and bonus round
    let colorClasses = ''
    if (status === 'correct') {
      colorClasses = isBonus 
        ? 'bg-orange-500 text-white border-orange-600' 
        : 'bg-green-500 text-white border-green-600'
    } else if (status === 'incorrect') {
      colorClasses = 'bg-red-500 text-white border-red-600'
    } else if (status === 'current') {
      colorClasses = 'bg-yellow-400 text-gray-900 border-yellow-500'
    }
    
    indicators.push(
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${colorClasses}`}
      >
        {isBonus ? '★' : i + 1}
      </motion.div>
    )
  }
  return indicators
}
```

### Progress Display

```typescript
<div className="flex justify-between items-center">
  <div className="text-center">
    <div className="text-2xl font-bold text-gray-900">{score}</div>
    <div className="text-sm text-gray-600">Score</div>
  </div>
  
  <div className="text-center">
    <div className="text-lg font-semibold text-gray-900">
      Question {currentQuestion + 1} of {totalQuestions}
    </div>
    <div className="text-sm text-gray-600">Progress</div>
  </div>
  
  <div className="text-center">
    <div className="text-2xl font-bold text-purple-600">
      {Math.round(((currentQuestion) / totalQuestions) * 100)}%
    </div>
    <div className="text-sm text-gray-600">Complete</div>
  </div>
</div>
```

**Features:**
- **Real-time score** - Updates immediately after each answer
- **Progress percentage** - Visual completion indicator
- **Question counter** - Clear position in quiz
- **Bonus round indicators** - Stars for bonus questions

## 📋 ResultsCard Component

Displays detailed results for individual questions with expandable explanations.

### Question Review Interface

```typescript
interface ResultsCardProps {
  questionNumber: number
  question: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  userAnswer?: 'A' | 'B' | 'C' | 'D'
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  isCorrect: boolean
}
```

### Option Styling System

```typescript
const getOptionStyling = (optionKey: 'A' | 'B' | 'C' | 'D') => {
  const isUserAnswer = userAnswer === optionKey
  const isCorrectOption = correctAnswer === optionKey
  
  if (isCorrectOption) {
    return 'bg-success-100 border-success-300 text-success-800'
  }
  
  if (isUserAnswer && !isCorrect) {
    return 'bg-danger-100 border-danger-300 text-danger-800'
  }
  
  return 'bg-gray-50 border-gray-200 text-text-secondary'
}
```

### Expandable Explanations

```typescript
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-gray-200 pt-4"
    >
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
          <InfoIcon />
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Explanation:</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

## 🎭 Animation Patterns

### Entrance Animations

```typescript
// Staggered option appearance
{shuffledOptions.map(({ key, text }, index) => (
  <motion.button
    key={key}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {text}
  </motion.button>
))}
```

### State Transition Animations

```typescript
// Smooth state changes
<motion.button
  animate={
    optionState === 'correct' ? 'correct' : 
    optionState === 'wrong' ? 'wrong' : 
    { opacity: 1, x: 0 }
  }
  transition={{ 
    delay: animationDelay, 
    duration: 0.3,
    type: "spring",
    stiffness: 200
  }}
>
```

### Feedback Animations

```typescript
// Success/failure indicators
{state === 'correct' && (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 500 }}
  >
    <SuccessAnimation />
  </motion.div>
)}
```

## 📱 Mobile Optimizations

### Touch-Friendly Design

```typescript
// Proper touch targets
className="min-h-touch-lg touch-manipulation"

// Touch event handling
onClick={() => handleTouchPress(onClick)}

// Accessibility attributes
role="button"
aria-pressed={isSelected}
aria-disabled={isDisabled}
```

### Responsive Layout

```typescript
// Mobile-first responsive design
className="
  p-3 sm:p-4                    // Padding
  text-sm sm:text-base          // Typography
  rounded-lg sm:rounded-xl      // Border radius
  space-y-2 sm:space-y-3        // Spacing
"
```

### Performance Optimizations

```typescript
// GPU-accelerated animations
transform: 'translateY(20px) scale(0.95)' // Instead of changing layout properties

// Reduced motion support
variants={getAccessibleVariants(animationVariants)}

// Efficient re-renders
const memoizedOptions = useMemo(() => 
  shuffleOptions(question.options), 
  [question.id]
)
```

## 🎯 Component Integration

### Quiz Flow Integration

```typescript
// In QuizGameLogic
<QuestionCard
  question={currentQ}
  questionNumber={currentQuestion + 1}
  totalQuestions={questions.length}
  timeRemaining={timeRemaining}
  onAnswer={handleAnswer}
  selectedAnswer={selectedAnswers[currentQuestion]}
  isAnswered={isAnswered}
/>
```

### State Management Integration

```typescript
// Real-time updates from Zustand
const {
  questions,
  selectedAnswers,
  currentQuestion,
  totalScore,
  recordQuestionResult
} = useQuizStore()
```

### Analytics Integration

```typescript
// Track user interactions
const handleAnswerSelect = (answer: string) => {
  trackEvent('question_answered', {
    question_id: question.id,
    selected_answer: answer,
    correct_answer: question.correctOption,
    is_correct: answer === question.correctOption,
    time_taken: config.questionTimeLimit - timeRemaining
  })
  
  onAnswer(answer)
}
```

## 🧪 Testing Patterns

### Component Testing

```typescript
describe('QuestionCard', () => {
  it('shows reading timer initially', () => {
    render(<QuestionCard {...defaultProps} />)
    expect(screen.getByText('Read the question carefully...')).toBeInTheDocument()
  })
  
  it('shuffles answer options', () => {
    const { rerender } = render(<QuestionCard {...defaultProps} />)
    const firstOrder = screen.getAllByRole('button').map(btn => btn.textContent)
    
    rerender(<QuestionCard {...defaultProps} question={differentQuestion} />)
    const secondOrder = screen.getAllByRole('button').map(btn => btn.textContent)
    
    expect(firstOrder).not.toEqual(secondOrder)
  })
})
```

### Integration Testing

```typescript
describe('Quiz Flow', () => {
  it('completes full quiz flow', async () => {
    render(<QuizGameLogic questions={mockQuestions} onQuizComplete={mockComplete} />)
    
    // Wait for reading period
    await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument())
    
    // Answer all questions
    for (let i = 0; i < mockQuestions.length; i++) {
      fireEvent.click(screen.getByText('Option A'))
      await waitFor(() => expect(mockComplete).toHaveBeenCalled())
    }
  })
})
```

## 🎨 Design System Compliance

### Color Usage

```typescript
// ✅ CORRECT - Solid colors only
const stateColors = {
  correct: 'bg-green-500',
  incorrect: 'bg-red-500',
  selected: 'bg-[#8B7FC8]',
  bonus: 'bg-orange-500'
}

// ❌ WRONG - No gradients
// bg-gradient-to-r from-green-400 to-green-600
```

### Typography

```typescript
// Consistent Poppins font usage
className="font-poppins font-medium text-base"
```

### Spacing and Layout

```typescript
// Consistent spacing system
className="p-4 sm:p-6 space-y-3 sm:space-y-4"
```

The quiz components provide a comprehensive, engaging, and technically sophisticated quiz experience that maintains excellent performance on mobile devices while delivering rich interactive feedback and smooth animations.