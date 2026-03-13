import pool from '../../config/db.js';
import levenshtein from 'fast-levenshtein';

// ─── Union-Find ────────────────────────────────────────────────────────────────
// Groups residents into clusters so that if A=B and B=C, all three end up
// in the same cluster (even if A and C were never directly compared).

class UnionFind {
  constructor() {
    this.parent = new Map();
  }

  find(x) {
    if (!this.parent.has(x)) this.parent.set(x, x);

    // Path compression: point every node directly to its root
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)));
    }

    return this.parent.get(x);
  }

  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent.set(rootB, rootA);
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns a Set of "id1-id2" strings for all pairs the user has
 * already marked as "not a duplicate".
 */
const fetchIgnoredPairKeys = async () => {
  const [rows] = await pool.query(`
    SELECT resident_id_1, resident_id_2
    FROM ignored_duplicates
  `);

  return {
    ignoredSet: new Set(rows.map(r => `${r.resident_id_1}-${r.resident_id_2}`)),
    totalIgnored: rows.length,
  };
};

/**
 * Fetches candidate duplicate pairs from the DB using SOUNDEX on names
 * and an exact match on sex as a cheap first-pass filter.
 * Also pulls middle_name and suffix for richer comparison.
 */
const fetchCandidatePairs = async () => {
  const [rows] = await pool.query(`
    SELECT
      p1.resident_id         AS resident_id_1,
      p2.resident_id         AS resident_id_2,

      fi1.survey_id          AS survey_id_1,
      fi2.survey_id          AS survey_id_2,

      p1.first_name          AS first_name_1,
      p2.first_name          AS first_name_2,

      p1.middle_name         AS middle_name_1,
      p2.middle_name         AS middle_name_2,

      p1.last_name           AS last_name_1,
      p2.last_name           AS last_name_2,

      p1.suffix              AS suffix_1,
      p2.suffix              AS suffix_2,

      p1.sex                 AS sex,

      DATE_FORMAT(p1.birthdate, '%m-%d-%Y') AS birthdate_1,
      DATE_FORMAT(p2.birthdate, '%m-%d-%Y') AS birthdate_2

    FROM population p1
    JOIN population p2
      ON  p1.resident_id < p2.resident_id        -- avoid self-pairs and duplicates
      AND p1.sex          = p2.sex                -- quick exact-match filter
      AND SOUNDEX(p1.first_name) = SOUNDEX(p2.first_name)
      AND SOUNDEX(p1.last_name)  = SOUNDEX(p2.last_name)

    JOIN family_information fi1 ON p1.family_id = fi1.family_id
    JOIN family_information fi2 ON p2.family_id = fi2.family_id
  `);

  return rows;
};

/**
 * Computes a similarity score for a candidate pair.
 *
 * Scoring breakdown (max = 9):
 *   First name  — up to 2 pts  (penalises each edit-distance step)
 *   Middle name — up to 1 pt   (exact match bonus; treated as optional)
 *   Last name   — up to 3 pts
 *   Suffix      — up to 1 pt   (exact match bonus; treated as optional)
 *   Birthdate   — up to 2 pts  (penalises each day of difference)
 */
const scorePair = (pair) => {
  const distance = (a, b) =>
    levenshtein.get((a ?? '').toLowerCase(), (b ?? '').toLowerCase());

  const daysDiff = (d1, d2) =>
    Math.abs(new Date(d1) - new Date(d2)) / (1000 * 60 * 60 * 24);

  const fnameDistance     = distance(pair.first_name_1,  pair.first_name_2);
  const mnameDistance     = distance(pair.middle_name_1, pair.middle_name_2);
  const lnameDistance     = distance(pair.last_name_1,   pair.last_name_2);
  const suffixDistance    = distance(pair.suffix_1,      pair.suffix_2);
  const birthdateDiffDays = daysDiff(pair.birthdate_1,   pair.birthdate_2);

  const similarityScore =
    Math.max(0, 2 - fnameDistance)     +   // 0–2 pts
    Math.max(0, 1 - mnameDistance)     +   // 0–1 pt  (optional field)
    Math.max(0, 3 - lnameDistance)     +   // 0–3 pts
    Math.max(0, 1 - suffixDistance)    +   // 0–1 pt  (optional field)
    Math.max(0, 2 - birthdateDiffDays);    // 0–2 pts

  return {
    ...pair,
    fnameDistance,
    mnameDistance,
    lnameDistance,
    suffixDistance,
    birthdateDiffDays,
    similarityScore,
  };
};

/**
 * Filters out pairs that are too different to be real duplicates.
 * Thresholds are intentionally tight to minimise false positives.
 */
const isLikelyDuplicate = (scored) =>
  scored.fnameDistance     <= 1 &&
  scored.lnameDistance     <= 2 &&
  scored.birthdateDiffDays <= 2 &&
  scored.similarityScore   >= 3;

/**
 * Builds a resident object (one card in the UI) from one side of a pair.
 */
const buildMember = (pair, side) => ({
  resident_id:  pair[`resident_id_${side}`],
  survey_id:    pair[`survey_id_${side}`],
  first_name:   pair[`first_name_${side}`],
  middle_name:  pair[`middle_name_${side}`],
  last_name:    pair[`last_name_${side}`],
  suffix:       pair[`suffix_${side}`],
  birthdate:    pair[`birthdate_${side}`],
  sex:          pair.sex,
  similarityScore: pair.similarityScore,
});

/**
 * Groups scored pairs into clusters using Union-Find, then formats each
 * cluster as { cluster_id, members[] } sorted by similarity score.
 */
const buildClusters = (scoredPairs) => {
  // Step 1 — link related residents together
  const uf = new UnionFind();
  scoredPairs.forEach(pair => uf.union(pair.resident_id_1, pair.resident_id_2));

  // Step 2 — collect unique members per cluster root
  const clustersMap = new Map(); // root → Map<residentId, memberObj>

  scoredPairs.forEach(pair => {
    const root = uf.find(pair.resident_id_1);

    if (!clustersMap.has(root)) clustersMap.set(root, new Map());
    const cluster = clustersMap.get(root);

    if (!cluster.has(pair.resident_id_1)) cluster.set(pair.resident_id_1, buildMember(pair, 1));
    if (!cluster.has(pair.resident_id_2)) cluster.set(pair.resident_id_2, buildMember(pair, 2));
  });

  // Step 3 — convert to array, sort members and clusters by score
  return Array.from(clustersMap.values())
    .map((membersMap, index) => ({
      cluster_id: `CLUSTER-${index + 1}`,
      members: Array.from(membersMap.values())
        .sort((a, b) => b.similarityScore - a.similarityScore),
    }))
    .sort((a, b) => b.members[0].similarityScore - a.members[0].similarityScore);
};

// ─── Controller ────────────────────────────────────────────────────────────────

export const getAllDuplicates = async (req, res) => {
  try {
    // 1. Load pairs the user has already dismissed
    const { ignoredSet, totalIgnored } = await fetchIgnoredPairKeys();

    // 2. Pull SOUNDEX-matched candidates from the DB
    const candidatePairs = await fetchCandidatePairs();

    // 3. Drop any pair the user has already marked as "not a duplicate"
    const unignoredPairs = candidatePairs.filter(
      pair => !ignoredSet.has(`${pair.resident_id_1}-${pair.resident_id_2}`)
    );

    // 4. Score each pair and keep only those above the similarity threshold
    const confirmedDuplicates = unignoredPairs
      .map(scorePair)
      .filter(isLikelyDuplicate);

    // 5. Group into clusters and format for the frontend
    const clusters = buildClusters(confirmedDuplicates);

    res.status(200).json({
      success: true,
      data: {
        total_duplicates: confirmedDuplicates.length,
        total_clusters:   clusters.length,
        total_ignored:    totalIgnored,
        clusters,
      },
    });

  } catch (error) {
    console.error('Error fetching duplicates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching duplicates data',
      error: error.message,
    });
  }
};