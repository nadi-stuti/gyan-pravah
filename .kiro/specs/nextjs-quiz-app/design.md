# Design Document

## Overview

A mobile-first quiz application built with Next.js 16, featuring a cartoony flat design with engaging animations powered by motion.dev (formerly Framer Motion). The app uses Zustand for lightweight state management, Strapi as a headless CMS, and PostHog for analytics tracking.

## Architecture

### Technology Stack

- **Frontend**: Next.js 16 with App Router
- **State Management**: Zustand (lightweight, minimal stores)
- **Animations**: motion.dev (latest Motion library)
- **Additional Animations**: Lottie React
- **Styling**: Tailwind CSS with custom cartoony theme
- **CMS**: Strapi (headless)
- **Analytics**: PostHog
- **Font**: Poppins (Google Fonts)
- **Storage**: localStorage for user preferences

### State Management Strategy

Using Zustand for minimal, focused state stores:

```typescript
// Quiz Store - Core game state
interface QuizState {
  currentQuestion: number
  selectedAnswers: Record<number, string>
  score: number
  timeRemaining: number
  isExpertMode: boolean
  gameStatus: 'idle' | 'playing' | 'completed'
}

// User Preferences Store - Persisted to localStorage
interface UserPreferencesState {
  isFirstVisit: boolean
  expertModeEnabled: boolean
  soundEnabled: boolean
  theme: 'default'
}
```

### Motion.dev Integration

Using the latest motion.dev API patterns:

```typescript
import { motion, AnimatePresence } from "motion/react"

// Modern motion.dev syntax for animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
/>
```

## Components and Interfaces

### Core Components Structure

```
src/
├── app/
│   ├── layout.tsx (Root layout with Poppins font)
│   ├── page.tsx (Home/Landing page)
│   ├── quiz/
│   │   └── page.tsx (Quiz game page)
│   └── results/
│       └── page.tsx (Results page)
├── components/
│   ├── ui/
│   │   ├── Button.tsx (Animated button component)
│   │   ├── Card.tsx (Quiz card container)
│   │   ├── Timer.tsx (Countdown timer)
│   │   └── ProgressBar.tsx (Quiz progress)
│   ├── quiz/
│   │   ├── QuestionCard.tsx (Individual question display)
│   │   ├── AnswerOptions.tsx (MCQ options)
│   │   ├── ScoreDisplay.tsx (Score animation)
│   │   └── ResultsCard.tsx (Answer review cards)
│   ├── home/
│   │   ├── PlayNowButton.tsx (Instant play)
│   │   ├── TopicSelector.tsx (Topic/subtopic selection)
│   │   └── ExpertModeToggle.tsx (Difficulty toggle)
│   └── animations/
│       ├── LottieWrapper.tsx (Lottie animation wrapper)
│       └── PageTransition.tsx (Page transition animations)
├── stores/
│   ├── useQuizStore.ts (Game state)
│   └── useUserPreferences.ts (User settings)
├── lib/
│   ├── strapi.ts (Strapi client)
│   ├── posthog.ts (Analytics setup)
│   └── utils.ts (Helper functions)
└── types/
    ├── quiz.ts (Quiz data types)
    └── api.ts (API response types)
```

### Key Component Interfaces

```typescript
// Question Component Props
interface QuestionCardProps {
  question: Question
  onAnswer: (answer: string) => void
  timeRemaining: number
  questionNumber: number
  totalQuestions: number
}

// Answer Option Props
interface AnswerOptionProps {
  option: string
  isSelected: boolean
  isCorrect?: boolean
  isRevealed?: boolean
  onClick: () => void
}

// Results Card Props
interface ResultsCardProps {
  question: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  isCorrect: boolean
}
```

## Data Models

### Strapi Content Types

```typescript
// Quiz Question Model
interface Question {
  id: number
  question: string
  options: string[] // Max 4-5 words each
  correctAnswer: string
  explanation: string
  topic: Topic
  subtopic: Subtopic
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  createdAt: string
  updatedAt: string
}

// Topic Model
interface Topic {
  id: number
  name: string
  slug: string
  subtopics: Subtopic[]
  icon?: string
}

// Subtopic Model
interface Subtopic {
  id: number
  name: string
  slug: string
  topic: Topic
  difficulty_distribution: {
    easy: number
    medium: number
    hard: number
  }
}

// Quiz Session Model
interface QuizSession {
  id: string
  questions: Question[]
  userAnswers: Record<number, string>
  score: number
  totalPossibleScore: number
  completedAt?: Date
  mode: 'normal' | 'expert' | 'first-visit'
  timeTaken: number
}
```

### Local Storage Schema

```typescript
interface StoredUserPreferences {
  isFirstVisit: boolean
  expertModeEnabled: boolean
  soundEnabled: boolean
  lastPlayedTopic?: string
  lastPlayedSubtopic?: string
  totalGamesPlayed: number
  bestScore: number
}
```

## Animation Strategy

### Motion.dev Implementation

```typescript
// Page transitions using AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
</AnimatePresence>

// Question card animations
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.8, opacity: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>

// Answer selection feedback
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  animate={isSelected ? { backgroundColor: "#10B981" } : {}}
  transition={{ duration: 0.2 }}
>
```

### Lottie Integration

```typescript
// Success/failure animations
import Lottie from 'lottie-react'
import successAnimation from '@/assets/animations/success.json'
import failAnimation from '@/assets/animations/fail.json'

<Lottie
  animationData={isCorrect ? successAnimation : failAnimation}
  loop={false}
  autoplay={true}
  style={{ width: 100, height: 100 }}
/>
```

## Responsive Design System

### Mobile-First Breakpoints

```css
/* Tailwind custom config */
module.exports = {
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    fontFamily: {
      'poppins': ['Poppins', 'sans-serif'],
    },
    colors: {
      // Cartoony flat color palette
      primary: {
        50: '#fef7ff',
        500: '#a855f7', // Purple from reference
        600: '#9333ea',
      },
      success: '#10b981', // Green
      warning: '#f59e0b', // Yellow
      danger: '#ef4444', // Red
      neutral: {
        100: '#f5f5f5',
        800: '#1f2937',
      }
    }
  }
}
```

### Component Responsiveness

```typescript
// Responsive quiz card
<motion.div className="
  w-full max-w-sm mx-auto
  sm:max-w-md
  md:max-w-lg
  p-4 sm:p-6
  text-sm sm:text-base
">
```

## Error Handling

### API Error Boundaries

```typescript
// Strapi connection error handling
class StrapiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'StrapiError'
  }
}

// Quiz data fallback
const fallbackQuestions: Question[] = [
  // Hardcoded easy questions for offline mode
]
```

### User Experience Error States

```typescript
// Loading states with skeleton animations
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ repeat: Infinity, duration: 1.5 }}
  className="bg-gray-200 rounded-lg h-20"
/>

// Error state with retry option
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center p-6"
>
  <p>Failed to load questions</p>
  <Button onClick={retryFetch}>Try Again</Button>
</motion.div>
```

## Testing Strategy

### Component Testing Focus

- **Quiz Flow**: Question progression, answer selection, timer functionality
- **State Management**: Zustand store updates and persistence
- **Animations**: Motion.dev animation completion and performance
- **Responsive Design**: Mobile-first layout testing
- **Analytics**: PostHog event tracking verification

### Testing Tools

- **Unit Tests**: Jest + React Testing Library
- **Animation Tests**: Test animation states and transitions
- **Integration Tests**: Quiz flow end-to-end scenarios
- **Performance Tests**: Animation performance and bundle size

### Key Test Scenarios

```typescript
// Example test structure
describe('Quiz Flow', () => {
  test('completes quiz with correct scoring', async () => {
    // Test full quiz completion
  })
  
  test('handles timer expiration correctly', async () => {
    // Test timeout behavior
  })
  
  test('persists expert mode preference', async () => {
    // Test localStorage integration
  })
})
```

## Performance Considerations

### Next.js 16 Optimizations

- **App Router**: Leveraging new routing capabilities
- **Server Components**: Static content rendering
- **Image Optimization**: Next.js Image component for Lottie fallbacks
- **Bundle Splitting**: Dynamic imports for animations

### Animation Performance

- **Hardware Acceleration**: Using transform and opacity for smooth animations
- **Reduced Motion**: Respecting user preferences
- **Lazy Loading**: Lottie animations loaded on demand

### Mobile Optimization

- **Touch Targets**: Minimum 44px touch areas
- **Gesture Handling**: Motion.dev gesture recognition
- **Battery Efficiency**: Optimized animation frame rates