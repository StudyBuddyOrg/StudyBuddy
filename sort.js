/*
 * High-Level Categories (priority order):
 *  1. Time       - Hard limiter. No overlap = no match.
 *  2. Study Type - Soft limiter. Same = preferred, mismatched = penalty.
 *  3. Major      - Mid-weight. Exact match best, loose match (same field) ok.
 *  4. Interests  - Low weight. Bonus points per shared interest.
 *
 * Score range: 0.0 – 1.0  (0 = incompatible, 1 = perfect match)
 */

// ---------------------------------------------------------------------------
// Student class
// ---------------------------------------------------------------------------

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

class Student {
  /**
   * @param {Object} timeRanges  - { monday: [[800, 1200], [1400, 1800]], ... }
   *                               Each day maps to an array of [start, end] ranges (HHMM ints).
   *                               Omit a day or leave it as [] if unavailable.
   * @param {string} studyType   - "quiet" | "social" | "mixed"
   * @param {string} major       - Free text, will be normalized before comparison.
   * @param {string[]} interests - Array of interest strings from a fixed list.
   */
  constructor(
    timeRanges = {},
    studyType  = "mixed",
    major      = "",
    interests  = []
  ) {
    // Fill in any missing days with empty availability
    this.timeRanges = Object.fromEntries(
      DAYS.map(d => [d, timeRanges[d] ?? []])
    );
    this.studyType = studyType;
    this.major     = normalizeMajor(major);
    this.interests = interests.map(i => i.toLowerCase().trim());
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Lowercase, trim, collapse whitespace */
function normalizeMajor(str) {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Returns total overlapping minutes between two sets of daily ranges.
 * Ranges are HHMM integers, e.g. 900 = 9:00 AM, 1330 = 1:30 PM.
 */
function dailyOverlapMinutes(rangesA, rangesB) {
  let total = 0;
  for (const [aStart, aEnd] of rangesA) {
    for (const [bStart, bEnd] of rangesB) {
      const overlapStart = Math.max(aStart, bStart);
      const overlapEnd   = Math.min(aEnd,   bEnd);
      if (overlapEnd > overlapStart) {
        // Convert HHMM diff to actual minutes
        total += hhmm2min(overlapEnd) - hhmm2min(overlapStart);
      }
    }
  }
  return total;
}

/** Convert HHMM integer → minutes since midnight */
function hhmm2min(hhmm) {
  return Math.floor(hhmm / 100) * 60 + (hhmm % 100);
}

/** Total overlap in minutes across all days */
function weeklyOverlapMinutes(studentA, studentB) {
  return DAYS.reduce((sum, day) => {
    return sum + dailyOverlapMinutes(studentA.timeRanges[day], studentB.timeRanges[day]);
  }, 0);
}

// ---------------------------------------------------------------------------
// Scoring functions  (each returns 0.0 – 1.0)
// ---------------------------------------------------------------------------

/**
 * TIME SCORE
 * Hard limiter: 0 overlap → score 0.
 * Soft scale: diminishing returns after ~3 hrs/week of shared time.
 */
function scoreTime(a, b) {
  const overlapMin = weeklyOverlapMinutes(a, b);
  if (overlapMin === 0) return 0;
  // Sigmoid-ish curve: 180 min (3 hrs) → ~0.86, 60 min → ~0.55
  return 1 - Math.exp(-overlapMin / 150);
}

/**
 * STUDY TYPE SCORE
 * Exact match → 1.0
 * "mixed" paired with anything → 0.7 (mixed is flexible)
 * Total mismatch (quiet vs social) → 0.0
 */
function scoreStudyType(a, b) {
  if (a.studyType === b.studyType) return 1.0;
  if (a.studyType === "mixed" || b.studyType === "mixed") return 0.7;
  return 0.0; // quiet vs social
}

/**
 * MAJOR SCORE
 * Exact match          → 1.0
 * Shared keyword match → 0.5  (e.g. "computer science" vs "data science")
 * No match             → 0.0
 */
function scoreMajor(a, b) {
  if (a.major === b.major) return 1.0;

  // Keyword overlap (ignore very short/common words)
  const stopWords = new Set(["of", "and", "in", "the", "for", "&"]);
  const wordsA = new Set(a.major.split(" ").filter(w => w.length > 2 && !stopWords.has(w)));
  const wordsB = new Set(b.major.split(" ").filter(w => w.length > 2 && !stopWords.has(w)));
  const shared = [...wordsA].filter(w => wordsB.has(w)).length;

  if (shared > 0) return 0.5;
  return 0.0;
}

/**
 * INTERESTS SCORE
 * Jaccard similarity: |intersection| / |union|
 * Ranges 0.0 – 1.0 naturally.
 */
function scoreInterests(a, b) {
  const setA = new Set(a.interests);
  const setB = new Set(b.interests);
  if (setA.size === 0 && setB.size === 0) return 0.5; // neither has interests → neutral
  const intersection = [...setA].filter(i => setB.has(i)).length;
  const union        = new Set([...setA, ...setB]).size;
  return intersection / union;
}

// ---------------------------------------------------------------------------
// Composite compatibility score
// ---------------------------------------------------------------------------

const WEIGHTS = {
  time:      0.45,
  studyType: 0.25,
  major:     0.20,
  interests: 0.10,
};

/**
 * Returns a compatibility object between two students.
 * { total: 0.0–1.0, breakdown: { time, studyType, major, interests } }
 * Returns null if time score is 0 (hard incompatibility).
 */
function compatibility(a, b) {
  const time = scoreTime(a, b);
  if (time === 0) return null; // hard limiter — don't bother scoring the rest

  const studyType = scoreStudyType(a, b);
  const major     = scoreMajor(a, b);
  const interests = scoreInterests(a, b);

  const total =
    time      * WEIGHTS.time +
    studyType * WEIGHTS.studyType +
    major     * WEIGHTS.major +
    interests * WEIGHTS.interests;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: { time, studyType, major, interests }
  };
}

// ---------------------------------------------------------------------------
// Matchmaking — find the best matches for a given student
// ---------------------------------------------------------------------------

/**
 * Given a target student and a pool of other students,
 * returns the pool sorted by compatibility score (descending).
 * Incompatible students (no time overlap) are excluded.
 *
 * @param {Student}   target
 * @param {Student[]} pool
 * @param {number}    minScore  - Exclude matches below this threshold (default 0.3)
 * @returns {{ student: Student, score: number, breakdown: Object }[]}
 */
function findMatches(target, pool, minScore = 0.3) {
  return pool
    .filter(s => s !== target)
    .map(s => {
      const result = compatibility(target, s);
      return result ? { student: s, ...result } : null;
    })
    .filter(r => r !== null && r.total >= minScore)
    .sort((a, b) => b.total - a.total);
}

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------

const alice = new Student(
  { monday: [[900, 1200]], wednesday: [[900, 1200], [1400, 1700]], friday: [[1000, 1300]] },
  "quiet",
  "Computer Science",
  ["reading", "chess", "programming"]
);

const bob = new Student(
  { monday: [[1000, 1300]], wednesday: [[1500, 1800]] },
  "quiet",
  "Computer Science",
  ["chess", "programming", "hiking"]
);

const carol = new Student(
  { tuesday: [[900, 1200]], thursday: [[1400, 1800]] },
  "social",
  "Psychology",
  ["reading", "art"]
);

const dave = new Student(
  { monday: [[800, 1400]], wednesday: [[900, 1600]], friday: [[900, 1200]] },
  "mixed",
  "Data Science",
  ["programming", "video games"]
);

const pool = [bob, carol, dave];
const matches = findMatches(alice, pool);

console.log("Matches for Alice:");
matches.forEach(m => {
  console.log(`  Score ${m.total} | Time: ${m.breakdown.time.toFixed(2)} | Type: ${m.breakdown.studyType} | Major: ${m.breakdown.major} | Interests: ${m.breakdown.interests.toFixed(2)}`);
});