import pool from '../../config/db.js';
import levenshtein from 'fast-levenshtein';

// Union-Find for clustering duplicates
class UnionFind {
  constructor() {
    this.parent = new Map();
  }

  find(x) {
    if (!this.parent.has(x)) this.parent.set(x, x);
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

export const getAllDuplicates = async (req, res) => {
  try {
    // 1️⃣ Pre-filter candidate duplicates using SQL
    const [rows] = await pool.query(`
      SELECT
        p1.resident_id,
        p2.resident_id AS possible_duplicate_id,
        p1.first_name AS first_name_1,
        p2.first_name AS first_name_2,
        p1.last_name  AS last_name_1,
        p2.last_name  AS last_name_2,
        DATE_FORMAT(p1.birthdate, '%m-%d-%Y') AS birthdate_1,
        DATE_FORMAT(p2.birthdate, '%m-%d-%Y') AS birthdate_2,
        p1.sex
      FROM population p1
      JOIN population p2
        ON p1.resident_id < p2.resident_id
       AND p1.sex = p2.sex
       AND SOUNDEX(p1.first_name) = SOUNDEX(p2.first_name)
       AND SOUNDEX(p1.last_name)  = SOUNDEX(p2.last_name)
       
    `);

    // 2️⃣ Apply Levenshtein distance and compute similarity score
    const duplicates = rows
      .map(row => {
        const fnameDistance = levenshtein.get(
          row.first_name_1.toLowerCase(),
          row.first_name_2.toLowerCase()
        );
        const lnameDistance = levenshtein.get(
          row.last_name_1.toLowerCase(),
          row.last_name_2.toLowerCase()
        );
        const birthdateDiff =
          Math.abs(new Date(row.birthdate_1) - new Date(row.birthdate_2)) /
          (1000 * 60 * 60 * 24);

        const similarityScore =
          (2 - fnameDistance) +
          (3 - lnameDistance) +
          (2 - birthdateDiff);

        return {
          ...row,
          fnameDistance,
          lnameDistance,
          birthdateDiff,
          similarityScore
        };
      })
      .filter(d =>
        d.fnameDistance <= 1 &&
        d.lnameDistance <= 2 &&
        d.birthdateDiff <= 2 &&
        d.similarityScore >= 3
      );

    // 3️⃣ Cluster duplicates using Union-Find
    const uf = new UnionFind();
    duplicates.forEach(d => uf.union(d.resident_id, d.possible_duplicate_id));

    const clustersMap = new Map();

    // Build clusters and include full resident info
    duplicates.forEach(d => {
      const root = uf.find(d.resident_id);
      if (!clustersMap.has(root)) clustersMap.set(root, new Map());

      const cluster = clustersMap.get(root);

      // Add resident 1
      if (!cluster.has(d.resident_id)) {
        cluster.set(d.resident_id, {
          resident_id: d.resident_id,
          first_name: d.first_name_1,
          last_name: d.last_name_1,
          birthdate: d.birthdate_1,
          sex: d.sex,
          similarityScore: d.similarityScore
        });
      }

      // Add resident 2
      if (!cluster.has(d.possible_duplicate_id)) {
        cluster.set(d.possible_duplicate_id, {
          resident_id: d.possible_duplicate_id,
          first_name: d.first_name_2,
          last_name: d.last_name_2,
          birthdate: d.birthdate_2,
          sex: d.sex,
          similarityScore: d.similarityScore
        });
      }
    });

    // 4️⃣ Format clusters as arrays and sort members by similarity
    const clusters = Array.from(clustersMap.entries())
      .map(([_, membersMap], index) => {
        const members = Array.from(membersMap.values())
          .sort((a, b) => b.similarityScore - a.similarityScore); // highest first
        return {
          cluster_id: `CLUSTER-${index + 1}`,
          members
        };
      })
      .sort((a, b) => b.members[0].similarityScore - a.members[0].similarityScore); // cluster with highest score first

    res.status(200).json({
      success: true,
      data: {
        total_duplicates: duplicates.length,
        total_clusters: clusters.length,
        clusters
      }
    });

  } catch (error) {
    console.error('Error fetching duplicates data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching duplicates data',
      error: error.message
    });
  }
};
