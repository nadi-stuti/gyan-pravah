import posthog from 'posthog-js'

// Analytics event types for type safety
export interface QuizAnalyticsEvents {
  // Quiz lifecycle events
  'quiz_started': {
    mode: 'normal' | 'expert' | 'first-visit' | 'random'
    topic?: string
    topics?: string[]
    subtopic?: string
    subtopics?: string[]
    difficulty?: 'Easy' | 'Medium' | 'Hard'
    total_questions: number
    is_expert_mode: boolean
    is_first_visit: boolean
    quiz_mode?: 'quizup' | 'quick' | 'marathon' | 'first-visit' | 'multi_topic'
  }
  
  'question_answered': {
    question_id: number
    question_number: number
    selected_answer: 'A' | 'B' | 'C' | 'D'
    correct_answer: 'A' | 'B' | 'C' | 'D'
    is_correct: boolean
    time_taken: number
    time_remaining: number
    points_earned: number
    difficulty: 'Easy' | 'Medium' | 'Hard'
    topic: string
    subtopic?: string
    is_bonus_round?: boolean
    question_type?: string
  }
  
  'question_timeout': {
    question_id: number
    question_number: number
    correct_answer: 'A' | 'B' | 'C' | 'D'
    difficulty: 'Easy' | 'Medium' | 'Hard'
    topic: string
    subtopic?: string
  }
  
  'quiz_completed': {
    final_score: number
    total_possible_score: number
    percentage: number
    questions_answered: number
    questions_correct: number
    normal_questions_correct?: number
    bonus_questions_correct?: number
    total_questions: number
    normal_questions?: number
    bonus_questions?: number
    time_taken_total: number
    average_time_per_question?: number
    mode: 'normal' | 'expert' | 'first-visit' | 'random' | string
    topic?: string
    subtopic?: string
    difficulty?: 'Easy' | 'Medium' | 'Hard'
    is_expert_mode: boolean
  }
  
  // User journey events
  'topic_selected': {
    topic: string
    topic_id: number
    subtopics_available: number
  }
  
  'subtopic_selected': {
    topic: string
    subtopic: string
    subtopic_id: number
  }
  
  'topic_selection_changed': {
    topic: string
    selected: boolean
    total_selected: number
  }
  
  'topics_confirmed': {
    selected_topics: string[]
    count: number
  }
  
  'subtopic_selected_multi': {
    topic: string
    subtopic: string
    total_selected: number
  }
  
  'difficulty_selected': {
    topic: string
    subtopic: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
  }
  
  'expert_mode_toggled': {
    enabled: boolean
    context: 'home_page' | 'results_page' | 'topic_selection'
  }
  
  'play_now_clicked': {
    is_expert_mode: boolean
    is_first_visit: boolean
  }
  
  // Results and replay events
  'results_viewed': {
    final_score: number
    percentage: number
    questions_correct: number
    total_questions: number
  }
  
  'replay_same_clicked': {
    previous_score: number
    previous_percentage: number
    mode: 'normal' | 'expert' | 'first-visit' | 'random'
  }
  
  'replay_expert_toggled': {
    previous_mode: 'normal' | 'expert'
    new_mode: 'normal' | 'expert'
    previous_score: number
  }
  
  'return_home_clicked': {
    final_score: number
    percentage: number
    context: 'results_page'
  }
  
  // Navigation events
  'page_viewed': {
    page: 'home' | 'quiz' | 'results' | 'topics' | 'subtopics'
    referrer?: string
  }
  
  // Error events
  'quiz_error': {
    error_type: 'api_failure' | 'no_questions' | 'network_error' | 'unknown'
    error_message: string
    context: string
  }
}

// Type-safe analytics tracking function
export function trackEvent<K extends keyof QuizAnalyticsEvents>(
  eventName: K,
  properties: QuizAnalyticsEvents[K]
): void {
  try {
    // Only track if PostHog is initialized and user hasn't opted out
    if (typeof window !== 'undefined' && posthog && !posthog.has_opted_out_capturing()) {
      posthog.capture(eventName, {
        ...properties,
        // Add common properties to all events
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      })
    }
  } catch (error) {
    // Silently fail - don't break the app if analytics fails
    console.warn('Analytics tracking failed:', error)
  }
}

// Identify user for better tracking (call this when user preferences are loaded)
export function identifyUser(userId: string, traits?: Record<string, any>): void {
  try {
    if (typeof window !== 'undefined' && posthog && !posthog.has_opted_out_capturing()) {
      posthog.identify(userId, traits)
    }
  } catch (error) {
    console.warn('User identification failed:', error)
  }
}

// Set user properties (for user preferences, settings, etc.)
export function setUserProperties(properties: Record<string, any>): void {
  try {
    if (typeof window !== 'undefined' && posthog && !posthog.has_opted_out_capturing()) {
      posthog.people.set(properties)
    }
  } catch (error) {
    console.warn('Setting user properties failed:', error)
  }
}

// Track page views
export function trackPageView(page: 'home' | 'quiz' | 'results' | 'topics' | 'subtopics', referrer?: string): void {
  trackEvent('page_viewed', { page, referrer })
}

// Utility function to generate consistent user ID from localStorage
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server-side-user'
  
  let userId = localStorage.getItem('quiz-user-id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('quiz-user-id', userId)
  }
  return userId
}

// Initialize user tracking (call this in app initialization)
export function initializeUserTracking(): void {
  if (typeof window === 'undefined') return
  
  const userId = getUserId()
  
  // Get user preferences from localStorage for initial traits
  const preferencesData = localStorage.getItem('quiz-user-preferences')
  let traits = {}
  
  if (preferencesData) {
    try {
      const preferences = JSON.parse(preferencesData)
      traits = {
        is_first_visit: preferences.state?.isFirstVisit ?? true,
        expert_mode_enabled: preferences.state?.expertModeEnabled ?? false,
        sound_enabled: preferences.state?.soundEnabled ?? true,
        total_games_played: preferences.state?.totalGamesPlayed ?? 0,
        best_score: preferences.state?.bestScore ?? 0,
        last_played_topic: preferences.state?.lastPlayedTopic,
        last_played_subtopic: preferences.state?.lastPlayedSubtopic,
      }
    } catch (error) {
      console.warn('Failed to parse user preferences for analytics:', error)
    }
  }
  
  identifyUser(userId, traits)
}

// Track quiz performance metrics
export function trackQuizPerformance(
  score: number,
  totalPossible: number,
  questionsCorrect: number,
  totalQuestions: number,
  timeTaken: number
): void {
  const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0
  
  // Set user properties for performance tracking
  setUserProperties({
    last_quiz_score: score,
    last_quiz_percentage: percentage,
    last_quiz_questions_correct: questionsCorrect,
    last_quiz_total_questions: totalQuestions,
    last_quiz_time_taken: timeTaken,
    last_quiz_date: new Date().toISOString(),
  })
}

// Track user journey milestones
export function trackUserJourney(milestone: string, context?: Record<string, any>): void {
  try {
    if (typeof window !== 'undefined' && posthog && !posthog.has_opted_out_capturing()) {
      posthog.capture('user_journey_milestone', {
        milestone,
        ...context,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.warn('User journey tracking failed:', error)
  }
}