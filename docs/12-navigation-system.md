# Navigation System

## 🧭 Navigation Overview

The Gyan Pravah navigation system provides intelligent routing, state-aware navigation guards, browser history management, and comprehensive user flow tracking. The system ensures users can navigate seamlessly while protecting quiz state and providing appropriate confirmations.

## 🏗️ Navigation Architecture

```
Navigation System Components:
├── NavigationHandler.tsx      # Global navigation logic
├── QuizExitHandler.tsx       # Quiz-specific exit handling
├── BackButton.tsx            # Consistent back navigation
├── NavigationButton.tsx      # Generic navigation with tracking
└── ClientLayout.tsx          # Page transitions and routing
```

## 🔄 NavigationHandler Component

The NavigationHandler provides global navigation logic and state protection.

### Browser History Management

```typescript
export default function NavigationHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const { gameStatus, questions, resetQuiz } = useQuizStore()

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Track all browser navigation events
      trackEvent('browser_navigation', {
        from_path: pathname,
        navigation_type: 'back_forward',
        has_quiz_data: questions.length > 0,
        game_status: gameStatus
      })

      // Protect active quiz state
      if (pathname === '/quiz' && gameStatus === 'playing') {
        const shouldLeave = window.confirm(
          'You have a quiz in progress. Are you sure you want to leave? Your progress will be lost.'
        )
        
        if (!shouldLeave) {
          // Prevent navigation
          event.preventDefault()
          window.history.pushState(null, '', '/quiz')
          return
        } else {
          // Allow navigation but clean up state
          resetQuiz()
          trackEvent('quiz_abandoned', {
            reason: 'browser_navigation',
            questions_answered: Object.keys(useQuizStore.getState().selectedAnswers).length,
            total_questions: questions.length
          })
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pathname, gameStatus, questions, resetQuiz, router])
}
```

### Route Validation

```typescript
// Validate route access based on application state
useEffect(() => {
  // Quiz page requires active quiz data
  if (pathname === '/quiz' && questions.length === 0 && gameStatus !== 'playing') {
    router.replace('/')
  }

  // Results page requires completed quiz data
  if (pathname === '/results' && questions.length === 0) {
    router.replace('/')
  }
}, [pathname, questions.length, gameStatus, router])
```

**Route Protection Features:**
- **State validation** - Ensures required data exists for each route
- **Automatic redirects** - Redirects to appropriate pages when state is invalid
- **User confirmation** - Asks for confirmation before losing quiz progress
- **Analytics tracking** - Tracks all navigation events for analysis

## 🚪 QuizExitHandler Component

Specialized handler for quiz-specific exit scenarios.

### Exit Confirmation System

```typescript
export default function QuizExitHandler() {
  const { gameStatus, questions, selectedAnswers } = useQuizStore()

  useEffect(() => {
    // Only active on quiz page during active quiz
    if (pathname !== '/quiz' || gameStatus !== 'playing') {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Browser refresh/close confirmation
      event.preventDefault()
      event.returnValue = 'You have a quiz in progress. Are you sure you want to leave?'
      return event.returnValue
    }

    const handleVisibilityChange = () => {
      // Track tab switching during quiz
      if (document.hidden) {
        trackEvent('quiz_tab_switched', {
          questions_answered: Object.keys(selectedAnswers).length,
          total_questions: questions.length,
          game_status: gameStatus
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname, gameStatus, questions.length, selectedAnswers])
}
```

**Exit Protection Features:**
- **Browser close/refresh** - Warns before losing quiz progress
- **Tab switching** - Tracks when users switch tabs during quiz
- **State cleanup** - Properly cleans up event listeners
- **Analytics integration** - Tracks user behavior patterns

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

## ➡️ NavigationButton Component

Generic navigation component with tracking and state management.

### Enhanced Navigation

```typescript
interface NavigationButtonProps {
  to: string                        // Destination route
  className?: string                // Custom styling
  children: ReactNode               // Button content
  onClick?: () => void              // Pre-navigation logic
  trackingData?: Record<string, any> // Custom analytics data
  disabled?: boolean                // Disable navigation
}

export default function NavigationButton({ 
  to, 
  className, 
  children,
  onClick,
  trackingData = {},
  disabled = false
}: NavigationButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (disabled) return

    // Track with custom analytics data
    trackEvent('navigation_button_clicked', {
      from_page: window.location.pathname,
      to_page: to,
      ...trackingData
    })

    // Execute pre-navigation logic
    if (onClick) {
      onClick()
    }
    
    // Navigate to destination
    router.push(to)
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
```

### Advanced Usage Examples

```typescript
// Basic navigation
<NavigationButton to="/quiz">
  Start Quiz
</NavigationButton>

// With analytics tracking
<NavigationButton 
  to="/topics" 
  trackingData={{ 
    source: 'home_page', 
    action: 'browse_topics',
    user_type: isExpertMode ? 'expert' : 'normal'
  }}
>
  Browse Topics
</NavigationButton>

// With pre-navigation logic
<NavigationButton 
  to="/quiz" 
  onClick={() => {
    // Prepare quiz data
    resetQuiz()
    setExpertMode(expertModeEnabled)
    loadQuestions()
  }}
  disabled={!isReady}
  trackingData={{ quiz_mode: 'expert' }}
>
  Continue Quiz
</NavigationButton>

// Conditional navigation
<NavigationButton 
  to={hasCompletedQuiz ? '/results' : '/quiz'}
  onClick={() => {
    if (!hasCompletedQuiz) {
      prepareQuiz()
    }
  }}
  trackingData={{ 
    action: hasCompletedQuiz ? 'view_results' : 'start_quiz' 
  }}
>
  {hasCompletedQuiz ? 'View Results' : 'Start Quiz'}
</NavigationButton>
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