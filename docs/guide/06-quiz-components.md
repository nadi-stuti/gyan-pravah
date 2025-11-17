# Quiz Components

## 🎮 Quiz Component System

The quiz components form the core interactive experience of the Gyan Pravah application. These specialized components handle question display, answer selection, progress tracking, and results presentation with sophisticated animations and mobile-optimized interactions.

## 🏗️ Component Architecture

### Quiz Component Hierarchy

```
Quiz System Components:
├── QuizGame.tsx               # Main quiz wrapper component
├── QuizGameLogic.tsx          # Core game orchestration
├── QuestionCard.tsx           # Question display with timer
└── Timer.tsx                  # Reusable timer component
```

**Simplified Architecture:**
- Removed complex components like AnswerOptions, GameHeader, ResultsCard
- Answer options are now inline in QuestionCard
- Progress display is simplified and inline
- Results use simple card layouts without dedicated components

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

### Category and Difficulty Display (v2.2)

```typescript
<span 
  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white"
  style={{ backgroundColor: questionNumber > 6 ? '#F59E0B' : '#FBBF24' }}
>
  {questionNumber > 6 ? '🎯 BONUS ROUND' : (question.quiz_subtopic?.name || question.quiz_subtopic?.quiz_topic?.topicName || 'General Knowledge')}
</span>
```

**v2.2 Topic Display Fix:**
- **Primary:** Shows `quiz_subtopic.name` (subtopic name) first
- **Fallback 1:** Shows `quiz_topic.topicName` if subtopic name missing
- **Fallback 2:** Shows 'General Knowledge' if both missing
- This ensures users see the most specific topic information available

**Visual Indicators:**
- **Topic badges** - Clear category identification
- **Bonus round highlighting** - Special styling for bonus questions
- **Cultural color coding** - Topic-specific color schemes
- **Emoji indicators** - Visual cues for different question types

## 🎯 Answer Selection (Inline)

Answer options are now rendered inline within QuestionCard for simplicity.

### Simple Answer Buttons

```typescript
// Inline answer rendering in QuestionCard
{shuffledOptions.map(({ key, text }) => {
  const isCorrect = key === question.correctOption
  const isSelected = selectedAnswer === key
  const showFeedback = isAnswered
  
  return (
    <motion.button
      key={key}
      onClick={() => !isAnswered && onAnswerSelect(key)}
      disabled={isAnswered}
      className={`
        w-full p-4 rounded-xl text-left transition-all
        ${isSelected && showFeedback && isCorrect ? 'bg-green-500 text-white' : ''}
        ${isSelected && showFeedback && !isCorrect ? 'bg-red-500 text-white' : ''}
        ${!showFeedback ? 'bg-white hover:bg-gray-50' : ''}
      `}
      whileHover={!isAnswered ? { scale: 1.02 } : {}}
      whileTap={!isAnswered ? { scale: 0.98 } : {}}
    >
      <span className="font-bold mr-3">{key}.</span>
      {text}
    </motion.button>
  )
})}
```

**Simplified Features:**
- **Inline rendering** - No separate component needed
- **Simple state logic** - Direct conditional styling
- **Basic animations** - Scale on hover/tap only
- **Clear visual feedback** - Green for correct, red for wrong

## 📊 Progress Display (Simplified)

Progress information is now displayed inline within QuizGameLogic for simplicity.

### Simple Progress Header

```typescript
// Inline progress display in QuizGameLogic
<div className="flex justify-between items-center mb-6">
  <div className="text-white">
    <div className="text-2xl font-bold">{totalScore}</div>
    <div className="text-sm opacity-80">Score</div>
  </div>
  
  <div className="text-white text-center">
    <div className="text-lg font-semibold">
      Question {currentQuestion + 1} of {questions.length}
    </div>
  </div>
  
  <div className="text-white text-right">
    <div className="text-2xl font-bold">{averageReactionTime.toFixed(1)}s</div>
    <div className="text-sm opacity-80">Avg Time</div>
  </div>
</div>
```

**Simplified Features:**
- **Inline rendering** - No separate component
- **Essential info only** - Score, progress, average time
- **Clean layout** - Three-column flex layout
- **No complex indicators** - Simple text display

## 📋 Results Display (Simplified)

Results are displayed using simple card layouts without dedicated components.

### Simple Results Layout

```typescript
// In results page - simple card rendering
{questions.map((question, index) => {
  const userAnswer = selectedAnswers[index]
  const isCorrect = userAnswer === question.correctOption
  
  return (
    <div key={question.id} className="bg-white rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Question {index + 1}</h3>
        <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
          {isCorrect ? '✓ Correct' : '✗ Wrong'}
        </span>
      </div>
      
      <p className="mb-4">{question.question}</p>
      
      <div className="space-y-2">
        {Object.entries(question.options).map(([key, text]) => (
          <div
            key={key}
            className={`p-3 rounded-lg ${
              key === question.correctOption ? 'bg-green-100' :
              key === userAnswer ? 'bg-red-100' : 'bg-gray-50'
            }`}
          >
            <span className="font-bold mr-2">{key}.</span>
            {text}
          </div>
        ))}
      </div>
      
      {question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">{question.explanation}</p>
        </div>
      )}
    </div>
  )
})}
```

**Simplified Features:**
- **Inline rendering** - No separate ResultsCard component
- **Simple conditional styling** - Direct className logic
- **Always visible explanations** - No expand/collapse
- **Clean card layout** - Easy to understand

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