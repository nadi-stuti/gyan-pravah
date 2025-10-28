// Content management types based on the topics-list structure

export interface TopicData {
  topicName: string;
  slug: string;
  topicIcon: string;
}

export interface SubtopicData {
  name: string;
  topicSlug: string;
  file: string | null; // null means "coming soon"
}

export interface ParsedQuestion {
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  difficulty: string;
  explanation: string;
}

export interface ParsedMarkdownFile {
  questions: ParsedQuestion[];
}

// Population script types
export interface PopulationStats {
  topicsCreated: number;
  subtopicsCreated: number;
  questionsCreated: number;
}

export interface PopulationConfig {
  strapiUrl: string;
  apiToken: string;
  markdownFilesDir: string;
}