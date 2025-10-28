/**
 * Centralized Quiz Configuration
 * Based on QuizUp's original game mechanics
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
 * Default Quiz Configuration - Based on QuizUp
 * 
 * QuizUp Structure:
 * - 6 normal questions (20 points max each)
 * - 1 bonus question (40 points max - double points)
 * - 10 seconds per question
 * - Points decrease by 1 per second of delay
 * - Minimum 11 points if answered correctly
 * - Maximum total: 160 points
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
 * Calculate points for a question based on QuizUp scoring system
 */
export function calculateQuestionPoints(
  isCorrect: boolean,
  timeRemaining: number,
  isBonusRound: boolean = false,
  config: QuizConfig = DEFAULT_QUIZ_CONFIG
): number {
  if (!isCorrect) return 0

  const maxPoints = isBonusRound
    ? config.maxPointsPerBonusQuestion
    : config.maxPointsPerNormalQuestion

  const timeTaken = config.questionTimeLimit - timeRemaining
  const pointsLost = Math.max(0, timeTaken * config.bonusPointsPerSecond)
  const finalPoints = Math.max(config.minimumPointsIfCorrect, maxPoints - pointsLost)

  return Math.round(finalPoints)
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