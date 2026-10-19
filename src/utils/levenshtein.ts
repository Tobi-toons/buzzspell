/**
 * Levenshtein distance calculation and mistake severity classification.
 */

export function computeLevenshtein(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();

  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j], // deletion
          dp[i][j - 1], // insertion
          dp[i - 1][j - 1] // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates mistake severity:
 * - 1: Minor (1 character off, e.g., single slip, minor swap) -> 1 retry attempt in Improve mode
 * - 2: Moderate (2-3 characters off) -> 2 retry attempts in Improve mode
 * - 3: Major (> 3 characters off or left blank) -> 3 retry attempts in Improve mode
 */
export function getMistakeSeverity(target: string, typed: string): 1 | 2 | 3 {
  const cleanTarget = target.toLowerCase().trim();
  const cleanTyped = typed.toLowerCase().trim();

  if (!cleanTyped || cleanTyped.length === 0) {
    return 3;
  }

  const distance = computeLevenshtein(cleanTarget, cleanTyped);

  if (distance <= 1) {
    return 1;
  } else if (distance <= 3) {
    return 2;
  } else {
    return 3;
  }
}

/**
 * Categorizes the type of spelling error for analytics.
 */
export function categorizeError(target: string, typed: string): string {
  const t = target.toLowerCase().trim();
  const g = typed.toLowerCase().trim();

  if (!g) return 'Timed out / Empty';

  const dist = computeLevenshtein(t, g);
  if (dist === 1) {
    if (g.length === t.length) return 'Single letter substitution';
    if (g.length < t.length) return 'Omitted letter';
    return 'Extra letter added';
  }

  // Check double consonants (e.g. embarrass vs embarass)
  const hasDoubleTarget = /(.)\1/.test(t);
  const hasDoubleGuess = /(.)\1/.test(g);
  if (hasDoubleTarget && !hasDoubleGuess) {
    return 'Missed double letter';
  }
  if (!hasDoubleTarget && hasDoubleGuess) {
    return 'Incorrect doubled letter';
  }

  // Check transposition
  if (t.length === g.length && dist === 2) {
    let diffCount = 0;
    const diffs: number[] = [];
    for (let i = 0; i < t.length; i++) {
      if (t[i] !== g[i]) {
        diffCount++;
        diffs.push(i);
      }
    }
    if (diffCount === 2 && diffs[1] === diffs[0] + 1) {
      if (t[diffs[0]] === g[diffs[1]] && t[diffs[1]] === g[diffs[0]]) {
        return 'Adjacent letter transposition (swap)';
      }
    }
  }

  if (dist <= 3) {
    return 'Phonetic or vowel confusion';
  }

  return 'Major spelling error';
}
