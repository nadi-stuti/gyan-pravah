/**
 * Centralized Quiz Configuration
 * Time-based scoring system with speed bonuses
 * 
 * Scoring Rules (10 second timer):
 * - Super Fast (8-10s): 20 points (10 base + 5 fast + 5 super fast)
 * - Fast (3-7s): 10-15 points (10 base + 1 per second above 3s)
 * - Late (0-2s): 5 points (fixed)
 * - Bonus rounds: 2x multiplier on all points
 */

export interface QuizConfig {
  // Question structure
  normalRounds: number
  bonusRounds: number
  totalQuestions: number

  // Timing
  questionTimeLimit: number // seconds
  feedbackDuration: number // milliseconds

  // Scoring
  maxPointsPerNormalQuestion: number
  maxPointsPerBonusQuestion: number
  basePoints: number
  bonusPointsPerSecond: number
  minimumPointsIfCorrect: number
  maxTotalScore: number

  // Difficulty distribution for random quizzes
  difficultyDistribution: {
    easy: number    // percentage
    medium: number  // percentage
    hard: number    // percentage
  }

  // Expert mode settings
  expertMode: {
    easy: number
    medium: number
    hard: number
  }
}

/**
 * Default Quiz Configuration
 * 
 * Quiz Structure:
 * - 6 normal questions (20 points max each)
 * - 1 bonus question (40 points max - double points)
 * - 10 seconds per question
 * - Time-based scoring with speed bonuses
 * - Maximum total: 160 points (6×20 + 1×40)
 * 
 * Scoring Breakdown:
 * - Super Fast (8-10s remaining): 20 points
 * - Fast (3-7s remaining): 10-15 points
 * - Late (0-2s remaining): 5 points
 * - Bonus round: 2x multiplier
 */
export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  // Question structure (QuizUp pattern)
  normalRounds: 6,
  bonusRounds: 1,
  totalQuestions: 7, // 6 normal + 1 bonus

  // Timing
  questionTimeLimit: 10, // QuizUp used 10 seconds, we use 20 for better UX
  feedbackDuration: 1500, // 1.5 seconds

  // Scoring (QuizUp system)
  maxPointsPerNormalQuestion: 20,
  maxPointsPerBonusQuestion: 40, // Double points for bonus round
  basePoints: 11, // Minimum points if correct
  bonusPointsPerSecond: 1, // Points lost per second of delay
  minimumPointsIfCorrect: 11,
  maxTotalScore: 160, // (6 × 20) + (1 × 40)

  // Difficulty distribution for random quizzes
  difficultyDistribution: {
    easy: 40,    // 40% easy questions
    medium: 40,  // 40% medium questions  
    hard: 20     // 20% hard questions
  },

  // Expert mode - harder distribution
  expertMode: {
    easy: 0,     // No easy questions
    medium: 60,  // 60% medium questions
    hard: 40     // 40% hard questions
  }
}

/**
 * Alternative configurations for different game modes
 */
export const QUIZ_CONFIGS = {
  // Original QuizUp style (10 seconds, 7 questions)
  QUIZUP_ORIGINAL: {
    ...DEFAULT_QUIZ_CONFIG,
    questionTimeLimit: 10,
  } as QuizConfig,

  // Relaxed mode (20 seconds, 5 questions for quick games)
  QUICK_MODE: {
    ...DEFAULT_QUIZ_CONFIG,
    normalRounds: 4,
    bonusRounds: 1,
    totalQuestions: 5,
    questionTimeLimit: 20,
    maxTotalScore: 120, // (4 × 20) + (1 × 40)
  } as QuizConfig,

  // Marathon mode (15 questions)
  MARATHON_MODE: {
    ...DEFAULT_QUIZ_CONFIG,
    normalRounds: 12,
    bonusRounds: 3,
    totalQuestions: 15,
    maxTotalScore: 360, // (12 × 20) + (3 × 40)
  } as QuizConfig,

  // First visit mode (very easy, 3 questions, no bonus)
  FIRST_VISIT: {
    ...DEFAULT_QUIZ_CONFIG,
    normalRounds: 3,
    bonusRounds: 0,
    totalQuestions: 3,
    questionTimeLimit: 30, // More time for first-time users
    maxTotalScore: 60, // (3 × 20) + (0 × 40)
    difficultyDistribution: {
      easy: 100,
      medium: 0,
      hard: 0
    }
  } as QuizConfig
}

/**
 * Get quiz configuration based on mode
 */
export function getQuizConfig(mode: 'quizup' | 'quick' | 'marathon' | 'first-visit' = 'quizup'): QuizConfig {
  switch (mode) {
    case 'quizup':
      return QUIZ_CONFIGS.QUIZUP_ORIGINAL
    case 'quick':
      return QUIZ_CONFIGS.QUICK_MODE
    case 'marathon':
      return QUIZ_CONFIGS.MARATHON_MODE
    case 'first-visit':
      return QUIZ_CONFIGS.FIRST_VISIT
    default:
      return DEFAULT_QUIZ_CONFIG
  }
}

/**
 * Calculate points for a question based on new scoring system
 * 
 * Scoring Rules (10 second timer):
 * 1. Super Fast (8-10 seconds remaining): 20 points
 *    - 10 points for correct answer
 *    - 5 points for answering above 3 seconds
 *    - 5 bonus points for super fast answer
 * 
 * 2. Fast (3-7 seconds remaining): 10-15 points
 *    - 10 points for correct answer
 *    - 1 point per second remaining above 3 seconds
 *    - Example: 6 seconds = 10 + (6-3) = 13 points
 * 
 * 3. Late (0-2 seconds remaining): 5 points
 *    - Only 5 points, no matter the time
 */
export function calculateQuestionPoints(
  isCorrect: boolean,
  timeRemaining: number,
  isBonusRound: boolean = false,
  config: QuizConfig = DEFAULT_QUIZ_CONFIG
): number {
  if (!isCorrect) return 0

  const BASE_POINTS = 10
  const SUPER_FAST_THRESHOLD = 8 // 8-10 seconds remaining
  const FAST_THRESHOLD = 3 // 3-7 seconds remaining
  const SUPER_FAST_BONUS = 5
  const FAST_ANSWER_BONUS = 5
  const LATE_ANSWER_POINTS = 5

  let points = 0
  let breakdown = {
    basePoints: 0,
    fastBonus: 0,
    superFastBonus: 0,
    totalPoints: 0
  }

  // Super Fast Answer (8-10 seconds remaining)
  if (timeRemaining >= SUPER_FAST_THRESHOLD) {
    breakdown.basePoints = BASE_POINTS
    breakdown.fastBonus = FAST_ANSWER_BONUS
    breakdown.superFastBonus = SUPER_FAST_BONUS
    points = BASE_POINTS + FAST_ANSWER_BONUS + SUPER_FAST_BONUS // 20 points
  }
  // Fast Answer (3-7 seconds remaining)
  else if (timeRemaining >= FAST_THRESHOLD) {
    breakdown.basePoints = BASE_POINTS
    const secondsAboveThreshold = timeRemaining - FAST_THRESHOLD
    breakdown.fastBonus = secondsAboveThreshold
    points = BASE_POINTS + secondsAboveThreshold // 10-15 points
  }
  // Late Answer (0-2 seconds remaining)
  else {
    breakdown.basePoints = LATE_ANSWER_POINTS
    points = LATE_ANSWER_POINTS // 5 points
  }

  breakdown.totalPoints = points

  // Double points for bonus rounds
  if (isBonusRound) {
    points *= 2
    breakdown.totalPoints = points
  }

  return Math.round(points)
}

/**
 * Get detailed point breakdown for display
 */
export function getPointBreakdown(
  timeRemaining: number,
  isBonusRound: boolean = false
): {
  category: 'super-fast' | 'fast' | 'late'
  basePoints: number
  fastBonus: number
  superFastBonus: number
  totalPoints: number
  multiplier: number
} {
  const BASE_POINTS = 10
  const SUPER_FAST_THRESHOLD = 8
  const FAST_THRESHOLD = 3
  const SUPER_FAST_BONUS = 5
  const FAST_ANSWER_BONUS = 5
  const LATE_ANSWER_POINTS = 5

  let category: 'super-fast' | 'fast' | 'late'
  let basePoints = 0
  let fastBonus = 0
  let superFastBonus = 0
  let totalPoints = 0
  const multiplier = isBonusRound ? 2 : 1

  if (timeRemaining >= SUPER_FAST_THRESHOLD) {
    category = 'super-fast'
    basePoints = BASE_POINTS
    fastBonus = FAST_ANSWER_BONUS
    superFastBonus = SUPER_FAST_BONUS
    totalPoints = (BASE_POINTS + FAST_ANSWER_BONUS + SUPER_FAST_BONUS) * multiplier
  } else if (timeRemaining >= FAST_THRESHOLD) {
    category = 'fast'
    basePoints = BASE_POINTS
    fastBonus = timeRemaining - FAST_THRESHOLD
    totalPoints = (BASE_POINTS + fastBonus) * multiplier
  } else {
    category = 'late'
    basePoints = LATE_ANSWER_POINTS
    totalPoints = LATE_ANSWER_POINTS * multiplier
  }

  return {
    category,
    basePoints,
    fastBonus,
    superFastBonus,
    totalPoints,
    multiplier
  }
}

/**
 * Calculate maximum possible score for a quiz
 */
export function calculateMaxScore(config: QuizConfig = DEFAULT_QUIZ_CONFIG): number {
  return (config.normalRounds * config.maxPointsPerNormalQuestion) +
    (config.bonusRounds * config.maxPointsPerBonusQuestion)
}

/**
 * Determine if a question is a bonus round
 */
export function isBonusRound(questionIndex: number, config: QuizConfig = DEFAULT_QUIZ_CONFIG): boolean {
  // Bonus rounds are the last questions in the quiz
  return questionIndex >= config.normalRounds
}

/**
 * Get question type label
 */
export function getQuestionTypeLabel(questionIndex: number, config: QuizConfig = DEFAULT_QUIZ_CONFIG): string {
  if (isBonusRound(questionIndex, config)) {
    return 'Bonus Round'
  }
  return `Question ${questionIndex + 1}`
}

/**
 * Generate difficulty distribution for questions
 */
export function generateDifficultyDistribution(
  totalQuestions: number,
  isExpertMode: boolean = false,
  config: QuizConfig = DEFAULT_QUIZ_CONFIG
): ('Easy' | 'Medium' | 'Hard')[] {
  const distribution = isExpertMode ? config.expertMode : config.difficultyDistribution
  const difficulties: ('Easy' | 'Medium' | 'Hard')[] = []

  // Calculate number of questions for each difficulty
  const easyCount = Math.round((distribution.easy / 100) * totalQuestions)
  const mediumCount = Math.round((distribution.medium / 100) * totalQuestions)
  const hardCount = totalQuestions - easyCount - mediumCount

  // Add difficulties to array
  for (let i = 0; i < easyCount; i++) difficulties.push('Easy')
  for (let i = 0; i < mediumCount; i++) difficulties.push('Medium')
  for (let i = 0; i < hardCount; i++) difficulties.push('Hard')

  // Shuffle the array to randomize order
  return difficulties.sort(() => Math.random() - 0.5)
}

/**
 * Quiz mode type definitions
 */
export type QuizMode = 'quizup' | 'quick' | 'marathon' | 'first-visit'

/**
 * Question round type
 */
export type QuestionRoundType = 'normal' | 'bonus'

/**
 * Quiz statistics interface
 */
export interface QuizStats {
  totalQuestions: number
  normalQuestions: number
  bonusQuestions: number
  maxPossibleScore: number
  questionsAnswered: number
  questionsCorrect: number
  normalQuestionsCorrect: number
  bonusQuestionsCorrect: number
  finalScore: number
  percentage: number
  averageTimePerQuestion: number
}

/**
 * Calculate comprehensive quiz statistics
 */
export function calculateQuizStats(
  questions: any[],
  selectedAnswers: Record<number, string>,
  finalScore: number,
  totalTimeTaken: number,
  config: QuizConfig = DEFAULT_QUIZ_CONFIG
): QuizStats {
  const questionsAnswered = Object.keys(selectedAnswers).length
  const questionsCorrect = questions.reduce((correct, question, index) => {
    const userAnswer = selectedAnswers[index]
    return userAnswer === question.correctOption ? correct + 1 : correct
  }, 0)

  let normalQuestionsCorrect = 0
  let bonusQuestionsCorrect = 0

  questions.forEach((question, index) => {
    const userAnswer = selectedAnswers[index]
    const isCorrect = userAnswer === question.correctOption

    if (isCorrect) {
      if (isBonusRound(index, config)) {
        bonusQuestionsCorrect++
      } else {
        normalQuestionsCorrect++
      }
    }
  })

  const maxPossibleScore = calculateMaxScore(config)
  const percentage = questions.length > 0 ? Math.round((questionsCorrect / questions.length) * 100) : 0
  const averageTimePerQuestion = totalTimeTaken / questions.length

  return {
    totalQuestions: config.totalQuestions,
    normalQuestions: config.normalRounds,
    bonusQuestions: config.bonusRounds,
    maxPossibleScore,
    questionsAnswered,
    questionsCorrect,
    normalQuestionsCorrect,
    bonusQuestionsCorrect,
    finalScore,
    percentage,
    averageTimePerQuestion
  }
}