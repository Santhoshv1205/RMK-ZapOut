import db from "../config/db.js";

export const getStaffDashboardStats = async (req, res) => {
  const { staffId } = req.params;
  const { role } = req.query;

  if (!staffId || !role) {
    return res.status(400).json({ message: "Missing staffId or role" });
  }

  try {
    let staffRow = null;

    // ✅ Detect staff table + department
    if (role === "COUNSELLOR") {
      const [rows] = await db.query(
        `SELECT c.id AS staff_table_id, c.department_id, d.display_name AS department_name
         FROM counsellors c
         JOIN departments d ON d.id = c.department_id
         WHERE c.user_id = ?`,
        [staffId]
      );
      if (!rows.length) return res.status(404).json({ message: "Counsellor not found" });
      staffRow = rows[0];
    }


else if (role === "HOD") {
  const [rows] = await db.query(
    `SELECT h.id, h.department_id, h.academic_type,
            d.display_name AS department_name
     FROM hods h
     LEFT JOIN departments d ON d.id = h.department_id
     WHERE h.user_id = ?`,
    [staffId]
  );

  if (!rows.length)
    return res.status(404).json({ message: "HOD not found" });

  const hod = rows[0];

  // ✅ Decide allowed years
  let allowedYears = [];

  if (hod.academic_type === "BASE_DEPT") {
    allowedYears = [1];
  } else if (hod.academic_type === "CORE_DEPT") {
    allowedYears = [2, 3, 4];
  }

  // ✅ Year-wise Student Stats
  const [yearStats] = await db.query(
    `
    SELECT 
      s.year_of_study AS year,
      COUNT(*) AS total_students,
      SUM(CASE WHEN s.student_type='HOSTELLER' THEN 1 ELSE 0 END) AS total_hostellers,
      SUM(CASE WHEN s.student_type='DAYSCHOLAR' THEN 1 ELSE 0 END) AS total_dayscholars
    FROM students s
    WHERE s.department_id = ?
      AND s.year_of_study IN (?)
    GROUP BY s.year_of_study
    ORDER BY s.year_of_study
    `,
    [hod.department_id, allowedYears]
  );

  // ✅ Total Staff in Department (Counsellors + Coordinators)
  const [[staffCount]] = await db.query(
    `
    SELECT 
      (
        (SELECT COUNT(*) FROM counsellors WHERE department_id = ?) +
        (SELECT COUNT(*) FROM coordinators WHERE department_id = ?)
      ) AS total_staff
    `,
    [hod.department_id, hod.department_id]
  );

  // ✅ Academic Calendar
  const [cal] = await db.query(
    `SELECT id, filename, cloud_url, uploaded_at
     FROM academic_calendars
     ORDER BY uploaded_at DESC
     LIMIT 1`
  );

  const stats = yearStats.map(r => ({
    year: `${r.year} Year`,
    total: Number(r.total_students),
    counselling: 0, // Not needed for HOD
    counselling_hostellers: Number(r.total_hostellers),
    counselling_dayscholars: Number(r.total_dayscholars),
    total_staff: Number(staffCount.total_staff)
  }));

  return res.json({
    staff: {
      role,
      department: hod.department_name,
      academic_type: hod.academic_type
    },
    stats,
    academicCalendar: cal
  });
}

    else if (role === "COORDINATOR") {
      const [rows] = await db.query(
        `SELECT id AS staff_table_id, department_id
         FROM coordinators
         WHERE user_id = ?`,
        [staffId]
      );
      if (!rows.length) return res.status(404).json({ message: "Coordinator not found" });

      const [dept] = await db.query(
        `SELECT display_name FROM departments WHERE id = ?`,
        [rows[0].department_id]
      );

      staffRow = {
        staff_table_id: rows[0].staff_table_id,
        department_id: rows[0].department_id,
        department_name: dept[0]?.display_name || ""
      };
    }

    else {
      return res.status(400).json({ message: "Unsupported role" });
    }

    // ✅ Year-wise stats
    const [yearStats] = await db.query(
      `
      SELECT 
        s.year_of_study AS year,
        COUNT(*) AS total,
        SUM(CASE WHEN s.counsellor_id = ? THEN 1 ELSE 0 END) AS counselling,
        SUM(CASE WHEN s.counsellor_id = ? AND s.student_type='HOSTELLER' THEN 1 ELSE 0 END) AS counselling_hostellers,
        SUM(CASE WHEN s.counsellor_id = ? AND s.student_type='DAYSCHOLAR' THEN 1 ELSE 0 END) AS counselling_dayscholars
      FROM students s
      WHERE s.department_id = ?
      GROUP BY s.year_of_study
      ORDER BY s.year_of_study
      `,
      [
        staffRow.staff_table_id,
        staffRow.staff_table_id,
        staffRow.staff_table_id,
        staffRow.department_id
      ]
    );

    // ✅ Academic Calendars
    const [cal] = await db.query(
      `SELECT id, filename, cloud_url, uploaded_at
       FROM academic_calendars
       ORDER BY uploaded_at DESC
       LIMIT 1`
    );

    const stats = yearStats.map(r => ({
      year: `${r.year} Year`,
      total: Number(r.total),
      counselling: Number(r.counselling),
      counselling_hostellers: Number(r.counselling_hostellers),
      counselling_dayscholars: Number(r.counselling_dayscholars)
    }));

    res.json({
      staff: {
        role,
        department: staffRow.department_name
      },
      stats,
      academicCalendar: cal
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    
    res.status(500).json({ message: "Server error" });
  }
};