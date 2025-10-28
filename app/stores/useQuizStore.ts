import { create } from 'zustand'
import type { QuizQuestion, QuizSession } from '@gyan-pravah/types'

// Quiz Store - Comprehensive game state
interface QuizState {
  // Game flow
  currentQuestion: number
  selectedAnswers: Record<number, string>
  timeRemaining: number
  isExpertMode: boolean
  gameStatus: 'idle' | 'playing' | 'completed'
  questions: QuizQuestion[]
  
  // Quiz configuration
  quizMode: 'quizup' | 'quick' | 'marathon' | 'first-visit' | null
  
  // Results data (stored during gameplay)
  pointsPerQuestion: Record<number, number> // Points earned for each question
  totalScore: number // Running total score
  questionsCorrect: number // Count of correct answers
  questionsAnswered: number // Count of answered questions
  maxPossibleScore: number // Maximum possible score for this quiz
  percentage: number // Calculated percentage
  
  // Actions
  setCurrentQuestion: (questionIndex: number) => void
  setSelectedAnswer: (questionIndex: number, answer: string) => void
  setTimeRemaining: (time: number) => void
  setExpertMode: (enabled: boolean) => void
  setGameStatus: (status: 'idle' | 'playing' | 'completed') => void
  setQuestions: (questions: QuizQuestion[]) => void
  setQuizMode: (mode: 'quizup' | 'quick' | 'marathon' | 'first-visit') => void
  setQuizConfig: (maxScore: number) => void
  
  // Result actions (called during gameplay)
  recordQuestionResult: (questionIndex: number, answer: string, points: number, isCorrect: boolean) => void
  
  resetQuiz: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  currentQuestion: 0,
  selectedAnswers: {},
  timeRemaining: 20,
  isExpertMode: false,
  gameStatus: 'idle',
  questions: [],
  
  // Quiz configuration
  quizMode: null,
  
  // Results data
  pointsPerQuestion: {},
  totalScore: 0,
  questionsCorrect: 0,
  questionsAnswered: 0,
  maxPossibleScore: 0,
  percentage: 0,
  
  // Actions
  setCurrentQuestion: (questionIndex) => set({ currentQuestion: questionIndex }),
  
  setSelectedAnswer: (questionIndex, answer) => 
    set((state) => ({
      selectedAnswers: { ...state.selectedAnswers, [questionIndex]: answer }
    })),
  
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setExpertMode: (enabled) => set({ isExpertMode: enabled }),
  setGameStatus: (status) => set({ gameStatus: status }),
  setQuestions: (questions) => set({ questions }),
  setQuizMode: (mode) => set({ quizMode: mode }),
  
  setQuizConfig: (maxScore) => set({ maxPossibleScore: maxScore }),
  
  // Record question result - this is the key method that stores everything
  recordQuestionResult: (questionIndex, answer, points, isCorrect) => {
    const state = get()
    const newPointsPerQuestion = { ...state.pointsPerQuestion, [questionIndex]: points }
    const newSelectedAnswers = { ...state.selectedAnswers, [questionIndex]: answer }
    const newTotalScore = state.totalScore + points
    const newQuestionsAnswered = state.questionsAnswered + 1
    const newQuestionsCorrect = state.questionsCorrect + (isCorrect ? 1 : 0)
    const newPercentage = state.questions.length > 0 ? Math.round((newQuestionsCorrect / state.questions.length) * 100) : 0
    
    set({
      selectedAnswers: newSelectedAnswers,
      pointsPerQuestion: newPointsPerQuestion,
      totalScore: newTotalScore,
      questionsAnswered: newQuestionsAnswered,
      questionsCorrect: newQuestionsCorrect,
      percentage: newPercentage
    })
  },
  
  resetQuiz: () => set({
    currentQuestion: 0,
    selectedAnswers: {},
    timeRemaining: 20,
    gameStatus: 'idle',
    questions: [],
    quizMode: null,
    pointsPerQuestion: {},
    totalScore: 0,
    questionsCorrect: 0,
    questionsAnswered: 0,
    maxPossibleScore: 0,
    percentage: 0,
  }),
}))