import pool from '../../config/db.js';

export const getSegregation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH age_brackets AS (
        SELECT '0-11 months' AS age_bracket, 0 AS sort_order
        UNION ALL
        SELECT CAST(n AS CHAR), n FROM (
          SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
          SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
          SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
          SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL
          SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL
          SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL
          SELECT 30 UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL
          SELECT 35 UNION ALL SELECT 36 UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL
          SELECT 40 UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL
          SELECT 45 UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL SELECT 49 UNION ALL
          SELECT 50 UNION ALL SELECT 51 UNION ALL SELECT 52 UNION ALL SELECT 53 UNION ALL SELECT 54 UNION ALL
          SELECT 55 UNION ALL SELECT 56 UNION ALL SELECT 57 UNION ALL SELECT 58 UNION ALL SELECT 59 UNION ALL
          SELECT 60 UNION ALL SELECT 61 UNION ALL SELECT 62 UNION ALL SELECT 63 UNION ALL SELECT 64 UNION ALL
          SELECT 65 UNION ALL SELECT 66 UNION ALL SELECT 67 UNION ALL SELECT 68 UNION ALL SELECT 69 UNION ALL
          SELECT 70 UNION ALL SELECT 71 UNION ALL SELECT 72 UNION ALL SELECT 73 UNION ALL SELECT 74 UNION ALL
          SELECT 75 UNION ALL SELECT 76 UNION ALL SELECT 77 UNION ALL SELECT 78 UNION ALL SELECT 79 UNION ALL
          SELECT 80 UNION ALL SELECT 81 UNION ALL SELECT 82 UNION ALL SELECT 83 UNION ALL SELECT 84 UNION ALL
          SELECT 85 UNION ALL SELECT 86 UNION ALL SELECT 87 UNION ALL SELECT 88 UNION ALL SELECT 89 UNION ALL
          SELECT 90 UNION ALL SELECT 91 UNION ALL SELECT 92 UNION ALL SELECT 93 UNION ALL SELECT 94 UNION ALL
          SELECT 95 UNION ALL SELECT 96 UNION ALL SELECT 97 UNION ALL SELECT 98 UNION ALL SELECT 99 UNION ALL
          SELECT 100
        ) numbers
        UNION ALL
        SELECT '101 and above', 101
      ),
      real_data AS (
        SELECT
          CASE
            WHEN TIMESTAMPDIFF(MONTH, p.birthdate, CURDATE()) < 12 THEN '0-11 months'
            WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 101 THEN '101 and above'
            ELSE CAST(TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS CHAR)
          END AS age_bracket,
          CASE
            WHEN h.barangay = 'San Rafael' AND h.sitio_yawran = TRUE THEN 'Yawran'
            ELSE h.barangay
          END AS barangay,
          p.sex
        FROM population p
        INNER JOIN family_information fi ON p.family_id = fi.family_id
        INNER JOIN households h ON fi.household_id = h.household_id
        WHERE p.birthdate IS NOT NULL
        AND p.sex IN ('Male', 'Female')
      )
      SELECT
        ab.age_bracket                                                                              AS 'Age Bracket',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Sta. Rosa'  AND rd.sex = 'Male'   THEN 1 END), 0)   AS 'Sta. Rosa_M',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Sta. Rosa'  AND rd.sex = 'Female' THEN 1 END), 0)   AS 'Sta. Rosa_F',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Sta. Maria' AND rd.sex = 'Male'   THEN 1 END), 0)   AS 'Sta. Maria_M',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Sta. Maria' AND rd.sex = 'Female' THEN 1 END), 0)   AS 'Sta. Maria_F',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Sta. Lucia' AND rd.sex = 'Male'   THEN 1 END), 0)   AS 'Sta. Lucia_M',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Sta. Lucia' AND rd.sex = 'Female' THEN 1 END), 0)   AS 'Sta. Lucia_F',
        COALESCE(SUM(CASE WHEN rd.barangay = 'San Rafael' AND rd.sex = 'Male'   THEN 1 END), 0)   AS 'San Rafael_M',
        COALESCE(SUM(CASE WHEN rd.barangay = 'San Rafael' AND rd.sex = 'Female' THEN 1 END), 0)   AS 'San Rafael_F',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Yawran'     AND rd.sex = 'Male'   THEN 1 END), 0)   AS 'Yawran_M',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Yawran'     AND rd.sex = 'Female' THEN 1 END), 0)   AS 'Yawran_F',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Raele'      AND rd.sex = 'Male'   THEN 1 END), 0)   AS 'Raele_M',
        COALESCE(SUM(CASE WHEN rd.barangay = 'Raele'      AND rd.sex = 'Female' THEN 1 END), 0)   AS 'Raele_F',
        COALESCE(SUM(CASE WHEN rd.sex = 'Male'   THEN 1 END), 0)                                  AS 'Total_M',
        COALESCE(SUM(CASE WHEN rd.sex = 'Female' THEN 1 END), 0)                                  AS 'Total_F'
      FROM age_brackets ab
      LEFT JOIN real_data rd ON rd.age_bracket = ab.age_bracket
      GROUP BY ab.age_bracket, ab.sort_order
      ORDER BY ab.sort_order
    `);
  
    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error('getAgeSegregation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAverageFamilySize = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        barangay_group,
        COUNT(DISTINCT resident_id)  AS totalResidents,
        COUNT(DISTINCT family_id)    AS totalFamilies,
        COUNT(DISTINCT household_id) AS totalHouseholds,

        ROUND(
          COUNT(DISTINCT resident_id) / NULLIF(COUNT(DISTINCT family_id),0),
          2
        ) AS averageFamilySize

      FROM (
        SELECT 
          CASE 
            WHEN h.barangay = 'San Rafael' AND h.sitio_yawran = 1 
              THEN 'Yawran'
            WHEN h.barangay = 'San Rafael'
              THEN 'San Rafael'
            ELSE h.barangay
          END AS barangay_group,
          p.resident_id,
          fi.family_id,
          h.household_id

        FROM households h
        LEFT JOIN family_information fi 
          ON fi.household_id = h.household_id
        LEFT JOIN population p 
          ON p.family_id = fi.family_id

      ) AS grouped_data

      GROUP BY barangay_group
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting average family size:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFamilyClassSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        barangay_group,
        SUM(CASE WHEN family_class = 'A' THEN 1 ELSE 0 END) AS A,
        SUM(CASE WHEN family_class = 'B' THEN 1 ELSE 0 END) AS B,
        SUM(CASE WHEN family_class = 'C' THEN 1 ELSE 0 END) AS C,
        SUM(CASE WHEN family_class = 'D' THEN 1 ELSE 0 END) AS D,
        SUM(CASE WHEN family_class = 'E' THEN 1 ELSE 0 END) AS E

      FROM (
        SELECT 
          CASE 
            WHEN h.barangay = 'San Rafael' AND h.sitio_yawran = 1 THEN 'Yawran'
            WHEN h.barangay = 'San Rafael' THEN 'San Rafael'
            ELSE h.barangay
          END AS barangay_group,
          fi.family_class,
          fi.family_id,
          h.household_id
        FROM family_information fi
        LEFT JOIN households h ON h.household_id = fi.household_id
      ) AS grouped_data

      GROUP BY barangay_group
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting average family size:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getYouthSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
            WHEN h.barangay = 'San Rafael' AND h.sitio_yawran = 1 THEN 'Sitio Yawran'
            ELSE h.barangay 
        END AS barangay,

        -- In School
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 17 AND sc.classification_code = 'IS' THEN 1 ELSE 0 END) AS "IS 15-17",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 18 AND 24 AND sc.classification_code = 'IS' THEN 1 ELSE 0 END) AS "IS 18-24",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 25 AND 30 AND sc.classification_code = 'IS' THEN 1 ELSE 0 END) AS "IS 25-30",

        -- Out of School
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 17 AND sc.classification_code = 'OSY' THEN 1 ELSE 0 END) AS "OSY 15-17",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 18 AND 24 AND sc.classification_code = 'OSY' THEN 1 ELSE 0 END) AS "OSY 18-24",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 25 AND 30 AND sc.classification_code = 'OSY' THEN 1 ELSE 0 END) AS "OSY 25-30",

        -- Working Youth
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 17 AND sc.classification_code = 'WY' THEN 1 ELSE 0 END) AS "WY 15-17",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 18 AND 24 AND sc.classification_code = 'WY' THEN 1 ELSE 0 END) AS "WY 18-24",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 25 AND 30 AND sc.classification_code = 'WY' THEN 1 ELSE 0 END) AS "WY 25-30",

        -- Non-Working Youth
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 17 AND sc.classification_code = 'NWY' THEN 1 ELSE 0 END) AS "NWY 15-17",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 18 AND 24 AND sc.classification_code = 'NWY' THEN 1 ELSE 0 END) AS "NWY 18-24",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 25 AND 30 AND sc.classification_code = 'NWY' THEN 1 ELSE 0 END) AS "NWY 25-30",

        -- Youth with Special Needs
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 17 AND sc.classification_code = 'PWD' THEN 1 ELSE 0 END) AS "PWD 15-17",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 18 AND 24 AND sc.classification_code = 'PWD' THEN 1 ELSE 0 END) AS "PWD 18-24",
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 25 AND 30 AND sc.classification_code = 'PWD' THEN 1 ELSE 0 END) AS "PWD 25-30",

        -- Total
        COUNT(DISTINCT p.resident_id) AS total_youth

    FROM households h
    JOIN family_information fi ON h.household_id = fi.household_id
    JOIN population p ON fi.family_id = p.family_id
    JOIN social_classification sc ON p.resident_id = sc.resident_id

    WHERE sc.classification_code IN ('IS', 'OSY', 'WY', 'NWY', 'PWD')
      AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 30

    GROUP BY 
        CASE 
            WHEN h.barangay = 'San Rafael' AND h.sitio_yawran = 1 THEN 'Sitio Yawran'
            ELSE h.barangay 
        END

    ORDER BY barangay;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting average family size:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOsySummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN h.sitio_yawran = 1 THEN 'Yawran'
          ELSE h.barangay
        END AS barangay_group,
        SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) AS male_osy,
        SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS female_osy,
        COUNT(*) AS total_osy
      FROM social_classification sc
      JOIN population p 
        ON sc.resident_id = p.resident_id
      JOIN family_information fi 
        ON p.family_id = fi.family_id
      JOIN households h 
        ON fi.household_id = h.household_id
      WHERE sc.classification_code = 'OSY'
      AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 24
      GROUP BY barangay_group 
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting average family size:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWomenSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN h.sitio_yawran = 1 THEN 'Yawran'
          ELSE h.barangay
        END AS barangay_group,
        SUM(CASE WHEN pi.occupation IS NOT NULL AND pi.occupation != 'None' THEN 1 ELSE 0 END) AS working,
        SUM(CASE WHEN pi.occupation IS NULL OR pi.occupation = 'None' THEN 1 ELSE 0 END) AS non_working,
        SUM(CASE WHEN pi.skills IS NOT NULL AND pi.skills != 'None' THEN 1 ELSE 0 END) AS skilled,
        SUM(CASE WHEN pi.skills IS NULL OR pi.skills = 'None' THEN 1 ELSE 0 END) AS unskilled,
        COUNT(*) AS total
      FROM population p
      LEFT JOIN professional_information pi
        ON p.resident_id = pi.resident_id
      JOIN family_information fi 
        ON p.family_id = fi.family_id
      JOIN households h 
        ON fi.household_id = h.household_id
      WHERE p.sex = 'Female'
      GROUP BY barangay_group 
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting women summary:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSoloParentSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN h.sitio_yawran = 1 THEN 'Yawran'
          ELSE h.barangay
        END AS barangay_group,
        SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) AS male_solo_parent,
        SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS female_solo_parent,
        COUNT(*) AS total_solo_parent,
        SUM(CASE WHEN sp.solo_parent_id IS NOT NULL THEN 1 ELSE 0 END) AS with_solo_parent_id
      FROM social_classification sc
      JOIN population p 
        ON sc.resident_id = p.resident_id
      JOIN family_information fi 
        ON p.family_id = fi.family_id
      JOIN households h 
        ON fi.household_id = h.household_id
      LEFT JOIN solo_parent_id_applications sp
        ON p.resident_id = sp.resident_id
      WHERE sc.classification_code = 'SP'
      GROUP BY barangay_group 
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting solo parent summary:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPwdSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN h.sitio_yawran = 1 THEN 'Yawran'
          ELSE h.barangay
        END AS barangay_group,
        SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) AS male_pwd,
        SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS female_pwd,
        COUNT(*) AS total_pwd
      FROM social_classification sc
      JOIN population p 
        ON sc.resident_id = p.resident_id
      JOIN family_information fi 
        ON p.family_id = fi.family_id
      JOIN households h 
        ON fi.household_id = h.household_id
      WHERE sc.classification_code = 'PWD'
      GROUP BY barangay_group 
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting average family size:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPwdCategory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN h.sitio_yawran = 1 THEN 'Yawran'
          ELSE h.barangay
        END AS barangay_group,
        SUM(CASE WHEN pi.occupation IS NOT NULL AND pi.occupation != 'None' THEN 1 ELSE 0 END) AS working,
        SUM(CASE WHEN pi.occupation IS NULL OR pi.occupation = 'None' THEN 1 ELSE 0 END) AS non_working,
        SUM(CASE WHEN pi.skills IS NOT NULL AND pi.skills != 'None' THEN 1 ELSE 0 END) AS skilled,
        SUM(CASE WHEN pi.skills IS NULL OR pi.skills = 'None' THEN 1 ELSE 0 END) AS unskilled,
        COUNT(*) AS total
      FROM social_classification sc
      JOIN population p 
        ON sc.resident_id = p.resident_id
      LEFT JOIN professional_information pi
        ON p.resident_id = pi.resident_id
      JOIN family_information fi 
        ON p.family_id = fi.family_id
      JOIN households h 
        ON fi.household_id = h.household_id
      WHERE sc.classification_code = 'PWD'
      GROUP BY barangay_group 
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting PWD category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPwdByDisability = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN h.sitio_yawran = 1 THEN 'Yawran'
          ELSE h.barangay
        END AS barangay_group,
        
        hi.disability_type,

        -- Age 0-4
        SUM(CASE WHEN p.sex = 'Male'   AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 0  AND 4  THEN 1 ELSE 0 END) AS male_0_4,
        SUM(CASE WHEN p.sex = 'Female' AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 0  AND 4  THEN 1 ELSE 0 END) AS female_0_4,

        -- Age 5-18
        SUM(CASE WHEN p.sex = 'Male'   AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 5  AND 18 THEN 1 ELSE 0 END) AS male_5_18,
        SUM(CASE WHEN p.sex = 'Female' AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 5  AND 18 THEN 1 ELSE 0 END) AS female_5_18,

        -- Age 19-59
        SUM(CASE WHEN p.sex = 'Male'   AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 19 AND 59 THEN 1 ELSE 0 END) AS male_19_59,
        SUM(CASE WHEN p.sex = 'Female' AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 19 AND 59 THEN 1 ELSE 0 END) AS female_19_59,

        -- Age 60+
        SUM(CASE WHEN p.sex = 'Male'   AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS male_60_above,
        SUM(CASE WHEN p.sex = 'Female' AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS female_60_above,

        -- Total
        SUM(CASE WHEN p.sex = 'Male'   THEN 1 ELSE 0 END) AS male_total,
        SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS female_total,
        COUNT(*) AS grand_total

      FROM social_classification sc
      JOIN population p
        ON sc.resident_id = p.resident_id
      JOIN family_information fi
        ON p.family_id = fi.family_id
      JOIN households h
        ON fi.household_id = h.household_id
      JOIN health_information hi
        ON p.resident_id = hi.resident_id
      WHERE sc.classification_code = 'PWD'
      AND hi.disability_type IS NOT NULL
      GROUP BY barangay_group, hi.disability_type
      ORDER BY barangay_group, hi.disability_type;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting PWD by disability:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNonIvatanSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN h.sitio_yawran = 1 THEN 'Yawran'
          ELSE h.barangay
        END AS barangay_group,
        SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) AS male_non_ivatan,
        SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS female_non_ivatan,
        COUNT(*) AS total_non_ivatan
      FROM social_classification sc
      JOIN population p 
        ON sc.resident_id = p.resident_id
      JOIN family_information fi 
        ON p.family_id = fi.family_id
      JOIN households h 
        ON fi.household_id = h.household_id
      WHERE sc.classification_code = 'PWD'
      GROUP BY barangay_group 
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting average family size:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSeniorCitizenSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN h.sitio_yawran = 1 THEN 'Yawran'
          ELSE h.barangay
        END AS barangay_group,

        -- Total counts
        SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) AS male,
        SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS female,
        COUNT(*) AS total,

        -- With Social Pension
        SUM(CASE WHEN p.sex = 'Male' AND pi.receiving_pension = 1 AND pi.pension_type = 'Social Pension' THEN 1 ELSE 0 END) AS male_social_pension,
        SUM(CASE WHEN p.sex = 'Female' AND pi.receiving_pension = 1 AND pi.pension_type = 'Social Pension' THEN 1 ELSE 0 END) AS female_social_pension,
        SUM(CASE WHEN pi.receiving_pension = 1 AND pi.pension_type = 'Social Pension' THEN 1 ELSE 0 END) AS total_social_pension,

        -- With Government Pension
        SUM(CASE WHEN p.sex = 'Male' AND pi.receiving_pension = 1 AND pi.pension_type = 'Government Pension' THEN 1 ELSE 0 END) AS male_government_pension,
        SUM(CASE WHEN p.sex = 'Female' AND pi.receiving_pension = 1 AND pi.pension_type = 'Government Pension' THEN 1 ELSE 0 END) AS female_government_pension,
        SUM(CASE WHEN pi.receiving_pension = 1 AND pi.pension_type = 'Government Pension' THEN 1 ELSE 0 END) AS total_government_pension,

        -- With Senior Citizen ID
        SUM(CASE WHEN p.sex = 'Male' AND sc_app.senior_citizen_id IS NOT NULL THEN 1 ELSE 0 END) AS male_with_id,
        SUM(CASE WHEN p.sex = 'Female' AND sc_app.senior_citizen_id IS NOT NULL THEN 1 ELSE 0 END) AS female_with_id,
        SUM(CASE WHEN sc_app.senior_citizen_id IS NOT NULL THEN 1 ELSE 0 END) AS total_with_id,

        -- Without Senior Citizen ID
        SUM(CASE WHEN p.sex = 'Male' AND sc_app.senior_citizen_id IS NULL THEN 1 ELSE 0 END) AS male_without_id,
        SUM(CASE WHEN p.sex = 'Female' AND sc_app.senior_citizen_id IS NULL THEN 1 ELSE 0 END) AS female_without_id,
        SUM(CASE WHEN sc_app.senior_citizen_id IS NULL THEN 1 ELSE 0 END) AS total_without_id

      FROM population p
      JOIN family_information fi 
        ON p.family_id = fi.family_id
      JOIN households h 
        ON fi.household_id = h.household_id
      LEFT JOIN professional_information pi 
        ON p.resident_id = pi.resident_id
      LEFT JOIN senior_citizen_id_applications sc_app 
        ON p.resident_id = sc_app.resident_id
      WHERE TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60
      GROUP BY barangay_group 
      ORDER BY barangay_group;
    `);
    
    return res.status(200).json({ data: rows });

  } catch (error) {
    console.error('Error getting senior citizen summary:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


