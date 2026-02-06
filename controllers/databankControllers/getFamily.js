import pool from '../../config/db.js';

export const getFamily = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
            fi.family_id as familyId,

            /* 2. Family head full name */
            fh.last_name   AS lastName,
            fh.first_name  AS firstName,
            fh.middle_name AS middleName,
            fh.suffix      AS suffix,

            /* 3. Total residents */
            COUNT(p.resident_id) AS totalResidents,

            /* 4. Total male */
            SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) AS totalMale,

            /* 5. Total female */
            SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS totalFemale,

            /* 6. Monthly income */
            fi.family_income as totalMonthlyIncome,

            /* 7. Total expenses (all expense tables) */
            (
                IFNULL(fe.total_food, 0) +
                IFNULL(ee.total_education, 0) +
                IFNULL(fxe.total_family, 0) +
                IFNULL(me.total_monthly, 0)
            ) AS totalMonthlyExpenses,

            /* 8. Livestock list */
            lv.livestock_list as otherResources,

            /* 9. Multiple family */
            h.multiple_family as multipleFamily,

            fi.family_class AS familyClass,

            h.barangay

        FROM family_information fi

        /* population (all members) */
        JOIN population p
            ON p.family_id = fi.family_id

        /* population (family head only) */
        JOIN population fh
            ON fh.family_id = fi.family_id
          AND fh.relation_to_family_head = 'FAMILY HEAD'

        /* household */
        JOIN households h
            ON h.household_id = fi.household_id

        /* ---------- EXPENSE SUBQUERIES ---------- */

        LEFT JOIN (
            SELECT survey_id, SUM(amount) AS total_food
            FROM food_expenses
            GROUP BY survey_id
        ) fe ON fe.survey_id = fi.survey_id

        LEFT JOIN (
            SELECT survey_id, SUM(amount) AS total_education
            FROM education_expenses
            GROUP BY survey_id
        ) ee ON ee.survey_id = fi.survey_id

        LEFT JOIN (
            SELECT survey_id, SUM(amount) AS total_family
            FROM family_expenses
            GROUP BY survey_id
        ) fxe ON fxe.survey_id = fi.survey_id

        LEFT JOIN (
            SELECT survey_id, SUM(amount) AS total_monthly
            FROM monthly_expenses
            GROUP BY survey_id
        ) me ON me.survey_id = fi.survey_id

        /* ---------- LIVESTOCK ---------- */

        LEFT JOIN (
            SELECT
                survey_id,
                GROUP_CONCAT(
                    CONCAT(
                        (own + dispersal), ' ', animal_type
                    )
                    ORDER BY animal_type
                    SEPARATOR ', '
                ) AS livestock_list
            FROM livestock
            WHERE (IFNULL(own, 0) + IFNULL(dispersal, 0)) > 0
            GROUP BY survey_id
        ) lv ON lv.survey_id = fi.survey_id


        GROUP BY
            fi.family_id,
            fh.last_name,
            fh.first_name,
            fh.middle_name,
            fh.suffix,
            fi.monthly_income,
            h.multiple_family,
            fe.total_food,
            ee.total_education,
            fxe.total_family,
            me.total_monthly,
            lv.livestock_list;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching family data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching family data', 
      error: error.message 
    });
  }
}


