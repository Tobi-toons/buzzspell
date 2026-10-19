export type GameRole = 'host' | 'player' | 'solo';

export type GamePhase = 'lobby' | 'playing' | 'results' | 'improving';

export interface SpellingWord {
  id: string;
  word: string;
  hint?: string;
  definition?: string;
}

export interface GameSettings {
  timeLimitSeconds: number; // 0 for unlimited, or 15, 20, 30, 45, 60
  speechRate: number; // 0.8 to 1.1
  speechPitch: number; // 0.9 to 1.1
  allowSlowPronounce: boolean;
}

export interface WordAttempt {
  wordId: string;
  targetWord: string;
  typedWord: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  errorSeverity: 1 | 2 | 3; // 1 = minor (1 char), 2 = moderate (2-3 chars), 3 = major (>3 chars or empty)
  distance: number;
  errorType?: string;
}

export interface MistakeRecord {
  word: string;
  totalAttempts: number;
  missCount: number;
  lastMissed: number;
  mastered: boolean;
  masteryDate?: number;
  commonMistakes: string[];
}

export interface AnalyticsData {
  totalGames: number;
  totalWordsAttempted: number;
  totalWordsCorrect: number;
  recentGames: {
    date: number;
    score: number;
    total: number;
    accuracy: number;
  }[];
  mistakes: Record<string, MistakeRecord>;
}

export type P2PMessage =
  | { type: 'PLAYER_JOINED'; playerName: string }
  | { type: 'HOST_HELLO'; hostName: string; settings: GameSettings; words: SpellingWord[] }
  | { type: 'SETTINGS_UPDATE'; settings: GameSettings; words: SpellingWord[] }
  | { type: 'START_GAME'; words: SpellingWord[]; settings: GameSettings }
  | { type: 'NEXT_WORD'; wordIndex: number; totalWords: number; timeLimitSeconds: number }
  | { type: 'LIVE_INPUT'; wordIndex: number; currentInput: string }
  | { type: 'WORD_SUBMITTED'; wordIndex: number; typedWord: string; isCorrect: boolean; timeSpentSeconds: number }
  | { type: 'PRONOUNCE_TRIGGER'; wordIndex: number; slow?: boolean }
  | { type: 'GAME_OVER'; attempts: WordAttempt[] }
  | { type: 'RESTART_TO_LOBBY' };
