# Navigation System

## 🧭 Navigation Overview

**Note:** As of v2.3, the navigation system has been significantly simplified to use Next.js built-in features with minimal custom logic. Complex navigation handlers and state protection mechanisms have been removed in favor of straightforward, maintainable patterns.

The Gyan Pravah navigation system now focuses on simple, direct routing using Next.js App Router with minimal abstractions.

## 🏗️ Navigation Architecture

The navigation system has been simplified to use Next.js built-in features with minimal custom logic.

```
Navigation System:
├── Next.js App Router        # Built-in routing
├── BackButton.tsx            # Simple back navigation
└── ClientLayout.tsx          # Minimal page transitions
```

**Note:** Complex navigation handlers (NavigationHandler, QuizExitHandler, NavigationButton) have been removed in favor of simpler, more maintainable patterns using Next.js built-in navigation.

## 🔄 Simplified Navigation

The navigation system now relies on Next.js built-in features with minimal custom logic.

### Browser Navigation

```typescript
// Simple navigation using Next.js router
import { useRouter } from 'next/navigation'

export default function Component() {
  const router = useRouter()
  
  const handleNavigation = () => {
    // Track navigation
    trackEvent('navigation', { to: '/quiz' })
    
    // Navigate
    router.push('/quiz')
  }
  
  return <button onClick={handleNavigation}>Start Quiz</button>
}
```

### Route Protection

Route protection is handled through simple checks in page components:

```typescript
// In quiz page component
export default function QuizPage() {
  const { questions } = useQuizStore()
  const router = useRouter()
  
  useEffect(() => {
    if (questions.length === 0) {
      router.replace('/')
    }
  }, [questions, router])
  
  return <QuizGame />
}
```

**Simplified Features:**
- **Direct routing** - Uses Next.js router directly
- **Component-level validation** - Each page validates its own requirements
- **Minimal abstractions** - No complex navigation handlers
- **Analytics tracking** - Simple event tracking where needed

## 🔙 BackButton Component

Provides consistent back navigation with intelligent routing.

### Smart Back Navigation

```typescript
interface BackButtonProps {
  to?: string           // Specific route to navigate to
  className?: string    // Custom styling
  children?: ReactNode  // Custom button content
  onBack?: () => void   // Custom back handler
}

export default function BackButton({ to, className, children, onBack }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Track navigation for analytics
    trackEvent('back_button_clicked', {
      from_page: window.location.pathname,
      to_page: to || 'browser_back'
    })

    if (onBack) {
      onBack()              // Custom logic
    } else if (to) {
      router.push(to)       // Specific route
    } else {
      router.back()         // Browser history
    }
  }

  return (
    <motion.button
      onClick={handleBack}
      className={`p-3 rounded-xl bg-white text-[#8B7FC8] shadow-md ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children || <BackArrowIcon />}
    </motion.button>
  )
}
```

### Usage Patterns

```typescript
// Default browser back
<BackButton />

// Specific route navigation
<BackButton to="/topics" />

// Custom back logic
<BackButton onBack={() => {
  // Custom cleanup or validation
  if (hasUnsavedChanges) {
    confirmDiscard()
  } else {
    router.back()
  }
}} />

// Custom styling and content
<BackButton 
  className="bg-red-500 text-white" 
  to="/home"
>
  <CustomBackIcon />
</BackButton>
```

## ➡️ Simple Navigation Buttons

Navigation buttons use standard Next.js Link components or router.push() with minimal abstraction.

### Basic Navigation Pattern

```typescript
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

export default function NavigationButton({ 
  to, 
  children,
  onClick,
  className = ''
}: {
  to: string
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) onClick()
    router.push(to)
  }

  return (
    <motion.button
      onClick={handleClick}
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}
```

### Usage Examples

```typescript
// Basic navigation
<button onClick={() => router.push('/quiz')}>
  Start Quiz
</button>

// With Link component
<Link href="/topics" className="button-class">
  Browse Topics
</Link>

// With pre-navigation logic
<button onClick={() => {
  resetQuiz()
  router.push('/quiz')
}}>
  New Quiz
</button>
```

## 🎭 Page Transitions

### ClientLayout Integration

The ClientLayout component handles page transitions with directional awareness.

```typescript
// Determine navigation direction based on route hierarchy
const getPageVariants = (pathname: string, previousPath?: string) => {
  const routeOrder = ['/', '/topics', '/topics/subtopics', '/quiz', '/results']
  const currentIndex = routeOrder.findIndex(route => pathname.startsWith(route))
  const previousIndex = previousPath ? routeOrder.findIndex(route => previousPath.startsWith(route)) : -1
  
  const isBackward = currentIndex < previousIndex && previousIndex !== -1

  // Subtle directional animations
  if (isBackward) {
    return {
      initial: { opacity: 0.8, x: -3 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0.8, x: 3 }
    }
  }

  return {
    initial: { opacity: 0.8, x: 3 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0.8, x: -3 }
  }
}
```

### Transition Configuration

```typescript
const pageTransition = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.15  // Fast, subtle transitions
}

// Apply transitions in layout
<AnimatePresence mode="popLayout" initial={false}>
  <motion.div
    key={pathname}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

## 🔄 Navigation Flow Patterns

### Quiz Flow Navigation

```typescript
// Complete quiz navigation flow
const QuizNavigationFlow = {
  // 1. Home → Topics
  startBrowsing: () => {
    trackEvent('navigation_started', { flow: 'topic_selection' })
    router.push('/topics')
  },

  // 2. Topics → Subtopics
  selectTopic: (topicSlug: string) => {
    trackEvent('topic_selected', { topic: topicSlug })
    router.push(`/topics/subtopics?topic=${topicSlug}`)
  },

  // 3. Subtopics → Quiz
  startQuiz: (subtopics: string[]) => {
    trackEvent('quiz_started', { 
      subtopics, 
      mode: 'topic_specific' 
    })
    
    // Prepare quiz state
    resetQuiz()
    setSelectedSubtopics(subtopics)
    
    router.push('/quiz')
  },

  // 4. Quiz → Results
  completeQuiz: (score: number) => {
    trackEvent('quiz_completed', { score })
    setGameStatus('completed')
    router.push('/results')
  },

  // 5. Results → Home/Replay
  finishQuiz: (action: 'home' | 'replay') => {
    trackEvent('quiz_finished', { action })
    
    if (action === 'replay') {
      resetQuiz()
      router.push('/quiz')
    } else {
      resetQuiz()
      router.push('/')
    }
  }
}
```

### Error Recovery Navigation

```typescript
// Navigation error recovery
const NavigationErrorRecovery = {
  // Handle invalid routes
  handleInvalidRoute: (pathname: string) => {
    trackEvent('navigation_error', { 
      error_type: 'invalid_route',
      attempted_path: pathname 
    })
    
    // Redirect to safe route
    router.replace('/')
  },

  // Handle missing quiz data
  handleMissingQuizData: (pathname: string) => {
    trackEvent('navigation_error', { 
      error_type: 'missing_quiz_data',
      attempted_path: pathname 
    })
    
    // Clear any stale state and redirect
    resetQuiz()
    router.replace('/')
  },

  // Handle network errors during navigation
  handleNetworkError: (error: Error) => {
    trackEvent('navigation_error', { 
      error_type: 'network_error',
      error_message: error.message 
    })
    
    // Show error message and provide retry
    showErrorMessage('Navigation failed. Please try again.')
    enableRetryButton()
  }
}
```

## 📊 Navigation Analytics

### Comprehensive Tracking

```typescript
// Track all navigation events
const NavigationAnalytics = {
  // Page view tracking
  trackPageView: (pageName: string) => {
    trackEvent('page_viewed', {
      page: pageName,
      referrer: document.referrer,
      timestamp: Date.now(),
      session_id: getSessionId()
    })
  },

  // Navigation flow tracking
  trackNavigationFlow: (from: string, to: string, method: string) => {
    trackEvent('navigation_flow', {
      from_page: from,
      to_page: to,
      navigation_method: method, // 'button', 'back', 'browser', 'programmatic'
      flow_step: getFlowStep(from, to),
      session_duration: getSessionDuration()
    })
  },

  // User journey tracking
  trackUserJourney: (milestone: string, context: Record<string, any>) => {
    trackEvent('user_journey', {
      milestone,
      ...context,
      journey_step: getCurrentJourneyStep(),
      total_steps: getTotalJourneySteps()
    })
  },

  // Exit intent tracking
  trackExitIntent: (reason: string, context: Record<string, any>) => {
    trackEvent('exit_intent', {
      reason,
      ...context,
      page_time: getPageTime(),
      scroll_depth: getScrollDepth()
    })
  }
}
```

### Navigation Metrics

```typescript
// Calculate navigation performance metrics
const NavigationMetrics = {
  // Measure navigation speed
  measureNavigationSpeed: (from: string, to: string) => {
    const start = performance.now()
    
    router.push(to).then(() => {
      const end = performance.now()
      const duration = end - start
      
      trackEvent('navigation_performance', {
        from_page: from,
        to_page: to,
        duration_ms: duration,
        is_slow: duration > 1000
      })
    })
  },

  // Track navigation patterns
  trackNavigationPattern: () => {
    const navigationHistory = getNavigationHistory()
    const pattern = analyzeNavigationPattern(navigationHistory)
    
    trackEvent('navigation_pattern', {
      pattern_type: pattern.type,
      pattern_frequency: pattern.frequency,
      common_paths: pattern.commonPaths
    })
  },

  // Monitor navigation errors
  monitorNavigationErrors: () => {
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('navigation')) {
        trackEvent('navigation_error', {
          error_type: 'unhandled_rejection',
          error_message: event.reason.message,
          stack_trace: event.reason.stack
        })
      }
    })
  }
}
```

## 🧪 Testing Navigation

### Navigation Testing Patterns

```typescript
describe('Navigation System', () => {
  it('protects quiz state during navigation', async () => {
    // Setup active quiz
    const { result } = renderHook(() => useQuizStore())
    act(() => {
      result.current.setQuestions(mockQuestions)
      result.current.setGameStatus('playing')
    })

    // Simulate browser back
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false)
    
    fireEvent(window, new PopStateEvent('popstate'))
    
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('quiz in progress')
    )
    expect(result.current.gameStatus).toBe('playing')
  })

  it('tracks navigation events', () => {
    const trackEventSpy = jest.fn()
    jest.mock('@/lib/analytics', () => ({ trackEvent: trackEventSpy }))

    render(<NavigationButton to="/quiz">Start Quiz</NavigationButton>)
    
    fireEvent.click(screen.getByText('Start Quiz'))
    
    expect(trackEventSpy).toHaveBeenCalledWith('navigation_button_clicked', {
      from_page: '/',
      to_page: '/quiz'
    })
  })

  it('handles route validation', () => {
    const mockPush = jest.fn()
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush, replace: mockPush }),
      usePathname: () => '/quiz'
    }))

    // Render with no quiz data
    render(<NavigationHandler />)
    
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
```

The navigation system provides a robust, user-friendly, and analytically rich foundation for managing user flow throughout the Gyan Pravah application while protecting important application state and providing excellent user experience.