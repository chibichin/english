export interface VocabItem {
  id: string;
  word: string;
  partOfSpeech: string;
  meaning: string;
  pronunciation: string;
  collocation: string;
  example: string;
  originPhrase?: string; // Original error or passage sentence
  correctedOrigin?: string; // Corrected sentence if any
  userSentence?: string; // User's custom sentence
  interestTopic: string;
  lastReviewed: string; // ISO date
  nextReview: string; // ISO date
  intervalDays: number; // Spaced repetition state
  level: number; // 1 (Seen) to 5 (Mastered)
  successfullyUsedInChat: boolean;
}

export interface GrammarErrorMap {
  id: string;
  originalText: string;
  correctedText: string;
  ruleExplanation: string;
  category: string; // E.g., Verb Tense, Subject-Verb Agreement, Collocation, Chinglish
  count: number; // For frequency tracking
  lastOccurred: string; // ISO date
}

export interface ReadingLog {
  id: string;
  title: string;
  body: string;
  listeningTranscript: string;
  interest: string;
  userSummary?: string;
  userOpinion?: string;
  studiedAt: string; // ISO date
}

export interface EssayLog {
  id: string;
  topic: string;
  originalContent: string;
  minimumCorrection: string;
  naturalB2: string;
  strengths: string;
  priorityImprovements: string;
  scores: {
    grammar: number;
    vocabulary: number;
    cohesion: number;
    overall: number;
  };
  corrections: Array<{
    original: string;
    improved: string;
    explanation: string;
    category: string;
  }>;
  wordsToSave?: Array<{
    word: string;
    partOfSpeech: string;
    meaning: string;
    example: string;
  }>;
  studiedAt: string; // ISO date
}

export interface ChatLog {
  id: string;
  topic: string;
  messages: Array<{
    id: string;
    sender: "user" | "coach";
    text: string;
    timestamp: string;
  }>;
  corrections: Array<{
    original: string;
    improved: string;
    explanation: string;
    category: string;
    isMajor: boolean;
  }>;
  startedAt: string; // ISO date
}

export interface ExploreInboxItem {
  id: string;
  text: string; // Word or query user thought of while studying
  note?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string; // ISO date
}

export interface DailyStudyStat {
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  vocabReviewed: number;
  vocabAdded: number;
  chatTurns: number;
  essaysWritten: number;
  readingsCompleted: number;
}

export interface AppState {
  vocabList: VocabItem[];
  grammarErrors: GrammarErrorMap[];
  readingLogs: ReadingLog[];
  essayLogs: EssayLog[];
  chatLogs: ChatLog[];
  exploreInbox: ExploreInboxItem[];
  dailyStats: DailyStudyStat[];
  currentInterest: string;
  currentCefr: string; // e.g. "B1"
  dailyMinutesGoal: number;
}
