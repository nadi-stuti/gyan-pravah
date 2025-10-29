// Quiz related types based on Strapi schema

export interface QuizTopic {
  id: number;
  documentId: string;
  topicName: string;
  slug: string;
  topicIcon: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  quiz_subtopics?: QuizSubtopic[];
  quiz_questions?: QuizQuestion[];
}

export interface QuizSubtopic {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  available: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  quiz_topic?: QuizTopic;
  quiz_questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  documentId: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  quiz_subtopic?: QuizSubtopic;
  quiz_topic?: QuizTopic;
}

// API Response types
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiCollectionResponse<T> extends StrapiResponse<T[]> {}
export interface StrapiSingleResponse<T> extends StrapiResponse<T> {}

// Quiz API specific response types
export type QuizTopicsResponse = StrapiCollectionResponse<QuizTopic>;
export type QuizTopicResponse = StrapiSingleResponse<QuizTopic>;
export type QuizSubtopicsResponse = StrapiCollectionResponse<QuizSubtopic>;
export type QuizSubtopicResponse = StrapiSingleResponse<QuizSubtopic>;
export type QuizQuestionsResponse = StrapiCollectionResponse<QuizQuestion>;
export type QuizQuestionResponse = StrapiSingleResponse<QuizQuestion>;

// Quiz Session and Game State types
export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  score: number;
  totalPossibleScore: number;
  completedAt?: Date;
  mode: 'normal' | 'expert' | 'first-visit';
  timeTaken: number;
}

export interface StoredUserPreferences {
  isFirstVisit: boolean;
  expertModeEnabled: boolean;
  soundEnabled: boolean;
  lastPlayedTopic?: string;
  lastPlayedSubtopic?: string;
  totalGamesPlayed: number;
  bestScore: number;
}