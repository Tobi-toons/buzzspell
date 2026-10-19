import { AnalyticsData, MistakeRecord, WordAttempt } from '../types';

const STORAGE_KEY = 'buzzspell_analytics_v1';

const defaultAnalytics: AnalyticsData = {
  totalGames: 0,
  totalWordsAttempted: 0,
  totalWordsCorrect: 0,
  recentGames: [],
  mistakes: {},
};

export function loadAnalytics(): AnalyticsData {
  if (typeof window === 'undefined') return defaultAnalytics;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAnalytics;
    const parsed = JSON.parse(raw);
    return {
      ...defaultAnalytics,
      ...parsed,
      mistakes: parsed.mistakes || {},
      recentGames: Array.isArray(parsed.recentGames) ? parsed.recentGames : [],
    };
  } catch (e) {
    console.error('Failed to load analytics from localStorage:', e);
    return defaultAnalytics;
  }
}

export function saveAnalytics(data: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save analytics to localStorage:', e);
  }
}

export function recordGameResults(attempts: WordAttempt[]): AnalyticsData {
  const current = loadAnalytics();

  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const totalCount = attempts.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  current.totalGames += 1;
  current.totalWordsAttempted += totalCount;
  current.totalWordsCorrect += correctCount;

  current.recentGames.unshift({
    date: Date.now(),
    score: correctCount,
    total: totalCount,
    accuracy,
  });

  // Keep last 30 games
  if (current.recentGames.length > 30) {
    current.recentGames = current.recentGames.slice(0, 30);
  }

  // Update mistake tracking
  attempts.forEach((att) => {
    const wordKey = att.targetWord.toLowerCase().trim();
    if (!wordKey) return;

    const existing: MistakeRecord = current.mistakes[wordKey] || {
      word: wordKey,
      totalAttempts: 0,
      missCount: 0,
      lastMissed: 0,
      mastered: false,
      commonMistakes: [],
    };

    existing.totalAttempts += 1;

    if (!att.isCorrect) {
      existing.missCount += 1;
      existing.lastMissed = Date.now();
      existing.mastered = false; // reset mastered status if missed again

      if (att.typedWord && !existing.commonMistakes.includes(att.typedWord)) {
        existing.commonMistakes.push(att.typedWord);
        if (existing.commonMistakes.length > 5) {
          existing.commonMistakes.shift();
        }
      }
    } else {
      // If was previously a mistake and now got correct
      if (existing.missCount > 0 && existing.totalAttempts >= existing.missCount * 2) {
        existing.mastered = true;
        existing.masteryDate = Date.now();
      }
    }

    current.mistakes[wordKey] = existing;
  });

  saveAnalytics(current);
  return current;
}

export function markWordMastered(word: string): void {
  const current = loadAnalytics();
  const wordKey = word.toLowerCase().trim();
  if (current.mistakes[wordKey]) {
    current.mistakes[wordKey].mastered = true;
    current.mistakes[wordKey].masteryDate = Date.now();
    saveAnalytics(current);
  }
}

export function getRecurringMistakes(analytics: AnalyticsData): MistakeRecord[] {
  return Object.values(analytics.mistakes)
    .filter((m) => m.missCount >= 1 && !m.mastered)
    .sort((a, b) => b.missCount - a.missCount || b.lastMissed - a.lastMissed);
}

export function getMasteredWords(analytics: AnalyticsData): MistakeRecord[] {
  return Object.values(analytics.mistakes)
    .filter((m) => m.mastered)
    .sort((a, b) => (b.masteryDate || 0) - (a.masteryDate || 0));
}

export function clearAnalyticsData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
