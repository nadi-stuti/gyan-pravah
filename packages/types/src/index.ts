// Re-export all types for easy importing
export * from './quiz';
export * from './strapi';
export * from './content';

// Export commonly used type combinations
export type { 
  QuizTopic, 
  QuizSubtopic, 
  QuizQuestion,
  QuizTopicsResponse,
  QuizSubtopicsResponse,
  QuizQuestionsResponse
} from './quiz';

export type {
  StrapiEntity,
  StrapiConfig,
  StrapiError
} from './strapi';

export type {
  TopicData,
  SubtopicData,
  ParsedQuestion,
  PopulationConfig
} from './content';