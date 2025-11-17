# App Router Structure

## 📁 Next.js App Router Overview

The application uses Next.js 13+ App Router, which provides a file-based routing system with enhanced features like layouts, loading states, and server components. The routing structure is organized in the `app/app/` directory.

## 🗂️ Directory Structure

```
app/app/
├── layout.tsx              # Root layout (applies to all pages)
├── page.tsx               # Home page (/)
├── error.tsx              # Global error handling
├── loading.tsx            # Global loading state
├── globals.css            # Global styles and Tailwind imports
├── favicon.ico            # App favicon
├── quiz/
│   ├── [topic]/
│   │   └── [subtopic]/
│   │       └── page.tsx  # Quiz game page (server component)
│   └── page.tsx          # Random quiz page
├── topics/
│   ├── page.tsx          # Topics selection (server component)
│   └── [topic]/
│       └── page.tsx      # Subtopics selection (server component)
└── results/
    └── page.tsx          # Quiz results (/results)
```

## 🏠 Root Layout (`layout.tsx`)

### Purpose
The root layout wraps all pages and provides:
- Font configuration (Poppins)
- Global metadata
- Client-side layout wrapper
- Base styling classes

### Code Analysis

```typescript
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { PHProvider } from "@/components/providers/PHProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gyan Pravah - Test Your Knowledge",
  description: "An engaging mobile-first quiz application focused on Indian cultural knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-poppins antialiased`}
      >
        <PHProvider>
          {children}
        </PHProvider>
      </body>
    </html>
  );
}
```

### Key Features

**Font Optimization:**
- Uses Next.js font optimization for Poppins
- `display: "swap"` prevents layout shift
- Multiple font weights loaded (300-700)
- CSS variable `--font-poppins` for Tailwind integration

**Metadata Configuration:**
- SEO-friendly title and description
- Applied to all pages by default
- Can be overridden in individual pages

**PostHog Provider:**
- Wraps app with analytics provider
- Client component for PostHog initialization
- Minimal client-side JavaScript

## 🏡 Home Page (`page.tsx`)

### Purpose
The home page serves as the main entry point with:
- First-visit detection and auto-quiz
- Topic selection navigation
- Expert mode toggle
- User preference management

### Key Features

**First Visit Logic:**
```typescript
useEffect(() => {
  const handleFirstVisit = async () => {
    if (isFirstVisit && !isFirstVisitHandled) {
      setIsFirstVisitHandled(true)
      
      // Start automatic first-visit quiz
      const questions = await strapiClient.getRandomQuestions(3, 'first-visit')
      setQuestions(questions)
      setGameStatus('playing')
      setFirstVisit(false)
      router.push('/quiz')
    }
  }
  
  handleFirstVisit()
}, [isFirstVisit, isFirstVisitHandled, router])
```

**State Management Integration:**
- Uses multiple Zustand stores
- Manages quiz state, user preferences, and subtopic availability
- Handles loading states and error conditions

**Navigation Options:**
- **Play Now Button** - Quick start with random questions
- **Choose Topics** - Navigate to topic selection
- **Expert Mode Toggle** - Switch difficulty levels

### Animation Implementation

```typescript
<motion.div
  initial={{ opacity: 0, y: -15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="text-center mb-6 sm:mb-8"
>
  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
    Gyan Pravah
  </h1>
</motion.div>
```

**Animation Strategy:**
- Staggered animations with delays
- Smooth entrance effects
- Mobile-optimized transitions
- Performance-conscious animation timing

## 🎯 Quiz Page (`/quiz`)

### Purpose
The quiz page handles the core quiz gameplay:
- Question display and interaction
- Answer selection and validation
- Progress tracking and scoring
- Quiz completion handling

### Route Protection

```typescript
useEffect(() => {
  // Redirect to home if no quiz is active
  if (questions.length === 0 || (gameStatus !== 'playing' && gameStatus !== 'completed')) {
    router.push('/')
  }
}, [gameStatus, questions.length, router])
```

**Protection Logic:**
- Prevents direct access without quiz data
- Redirects to home if no active quiz
- Maintains quiz state integrity
- Handles edge cases gracefully

### Component Architecture

```typescript
return (
  <div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
    <QuizExitHandler />
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <QuizGameLogic
        questions={questions}
        onQuizComplete={handleQuizComplete}
        quizMode="quizup"
        className="w-full"
      />
    </div>
  </div>
)
```

**Key Components:**
- **QuizExitHandler** - Manages quiz exit behavior
- **QuizGameLogic** - Core quiz functionality
- Responsive container with mobile-first design

## 📚 Topics Page (`/topics`)

### Purpose
Server component that displays available quiz topics:
- Fetches topics server-side with caching
- Shows subtopic availability
- Passes data to client components for interaction
- Optimized performance with Next.js caching

### Server-Side Data Loading

```typescript
// Server Component
export default async function TopicsPage() {
  // Fetch topics server-side with caching
  const topics = await getTopicsWithAvailability()
  
  // Pass to client component for interactivity
  return <TopicGrid topics={topics} />
}

// Server-side fetch with caching
async function getTopicsWithAvailability() {
  const res = await fetch(`${STRAPI_URL}/api/quiz-topics?populate=*`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  
  if (!res.ok) throw new Error('Failed to fetch topics')
  return res.json()
}
```

**Loading Strategy:**
- Server-side data fetching
- Next.js automatic caching
- Revalidation every hour
- No client-side loading states needed

### Topic Grid Client Component

```typescript
'use client'

// Client component for interactivity
export function TopicGrid({ topics }: { topics: QuizTopic[] }) {
  const router = useRouter()
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {topics.map((topic, index) => {
        const availableSubtopics = topic.quiz_subtopics?.filter(
          subtopic => subtopic.questionCount > 0
        ).length || 0
        
        return (
          <motion.button
            key={topic.id}
            onClick={() => router.push(`/topics/${topic.slug}`)}
            className="bg-white rounded-2xl p-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Topic content */}
          </motion.button>
        )
      })}
    </div>
  )
}
```

**Grid Features:**
- Client component for animations and navigation
- Data passed from server component
- Responsive 2-column layout
- Smooth animations and interactions

## 🏆 Results Page (`/results`)

### Purpose
Comprehensive results display with:
- Score visualization and breakdown
- Question-by-question review
- Performance analytics
- Replay options

### Score Calculation Display

```typescript
const finalScore = totalScore
const totalQuestions = questions.length

// Performance message based on percentage
{percentage >= 80 && "🎉 Excellent work! You're a quiz master!"}
{percentage >= 60 && percentage < 80 && "👏 Great job! Keep it up!"}
{percentage >= 40 && percentage < 60 && "👍 Good effort! Practice makes perfect!"}
{percentage < 40 && "💪 Keep learning! You'll get better with practice!"}
```

**Score Display Features:**
- Animated score reveal
- Percentage-based feedback messages
- Emoji-based visual feedback
- Bonus question tracking

### Question Review System

```typescript
{questions.map((question, index) => {
  const userAnswer = selectedAnswers[index] as 'A' | 'B' | 'C' | 'D' | undefined
  const isCorrect = userAnswer === question.correctOption
  const isBonus = isBonusRound(index, config)
  const earnedPoints = pointsPerQuestion[index] || 0

  return (
    <motion.div key={question.id} className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Question review content */}
    </motion.div>
  )
})}
```

**Review Features:**
- Individual question analysis
- Answer comparison (user vs correct)
- Point breakdown per question
- Detailed explanations
- Visual indicators for correctness

### Action Buttons

```typescript
<button onClick={handleReplaySame}>🔄 Play Again</button>
<button onClick={handleReplayExpert}>⚡ {isExpertMode ? 'Try Normal Mode' : 'Try Expert Mode'}</button>
<button onClick={handleReturnHome}>🏠 Choose New Topic</button>
```

**Button Functions:**
- **Play Again** - Same settings, new questions
- **Expert Toggle** - Switch difficulty and replay
- **Return Home** - Reset and go to main menu

## 🔄 Routing Patterns

### Navigation Flow

```
Home (/) 
├── → /quiz (direct play)
├── → /topics (topic selection)
│   └── → /topics/subtopics (subtopic selection)
│       └── → /quiz (topic-specific quiz)
└── → /results (after quiz completion)
    ├── → /quiz (replay)
    └── → / (return home)
```

### Route Protection Strategy

**Quiz Page Protection:**
```typescript
// Redirect if no active quiz
if (questions.length === 0 || gameStatus !== 'playing') {
  router.push('/')
}
```

**Results Page Protection:**
```typescript
// Redirect if no quiz data
if (questions.length === 0) {
  router.push('/')
}
```

**Benefits:**
- Prevents invalid states
- Maintains data integrity
- Provides clear user flow
- Handles edge cases gracefully

## 📱 Mobile-First Routing

### Touch-Friendly Navigation

```typescript
className="min-h-touch-lg touch-manipulation"
```

**Mobile Optimizations:**
- Minimum touch target sizes (44px)
- Touch manipulation optimization
- Swipe gesture support
- Responsive breakpoints

### Performance Considerations

**Code Splitting:**
- Each page is automatically code-split
- Components loaded on demand
- Reduced initial bundle size

**Prefetching:**
- Next.js automatically prefetches linked pages
- Faster navigation between routes
- Better perceived performance

## 🎨 Layout Consistency

### Shared Design Elements

**Background Colors:**
```typescript
style={{ backgroundColor: '#8B7FC8' }} // Primary purple
```

**Container Patterns:**
```typescript
<div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
```

**Responsive Spacing:**
- Consistent padding and margins
- Mobile-first responsive design
- Touch-friendly spacing

### Animation Consistency

**Entrance Animations:**
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 }}
```

**Interaction Feedback:**
```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

This App Router structure provides a solid foundation for the quiz application with clear separation of concerns, consistent patterns, and excellent user experience across all routes.