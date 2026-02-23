// controllers/studentDashboardController.js

import db from "../config/db.js";

export const getStudentDashboardStats = async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  try {
    /* =========================================
       1️⃣ Get student table ID + basic info
    ========================================== */
    const [studentRows] = await db.query(
      `
      SELECT s.id, s.department_id, d.display_name AS department_name
      FROM students s
      LEFT JOIN departments d ON d.id = s.department_id
      WHERE s.user_id = ?
      `,
      [studentId]
    );

    if (!studentRows.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentRows[0];

    /* =========================================
       2️⃣ Get Request Summary
    ========================================== */
    const [statsRows] = await db.query(
      `
      SELECT
        COUNT(*) AS total_requests,

        SUM(CASE 
            WHEN status IN ('SUBMITTED','COUNSELLOR_APPROVED','COORDINATOR_APPROVED') 
            THEN 1 ELSE 0 END
        ) AS pending_requests,

        SUM(CASE 
            WHEN status IN ('HOD_APPROVED','WARDEN_APPROVED') 
            THEN 1 ELSE 0 END
        ) AS approved_requests,

        SUM(CASE 
            WHEN status = 'REJECTED' 
            THEN 1 ELSE 0 END
        ) AS rejected_requests

      FROM requests
      WHERE student_id = ?
      `,
      [student.id]
    );

    const summary = {
      total: Number(statsRows[0].total_requests || 0),
      pending: Number(statsRows[0].pending_requests || 0),
      approved: Number(statsRows[0].approved_requests || 0),
      rejected: Number(statsRows[0].rejected_requests || 0),
    };

    /* =========================================
       3️⃣ Academic Calendar (Latest)
    ========================================== */
    const [cal] = await db.query(
      `
      SELECT id, filename, cloud_url, uploaded_at
      FROM academic_calendars
      ORDER BY uploaded_at DESC
      LIMIT 1
      `
    );

    /* =========================================
       4️⃣ Final Response (Staff-style format)
    ========================================== */
    res.json({
      student: {
        department: student.department_name
      },
      stats: summary,
      academicCalendar: cal
    });

  } catch (error) {
    console.error("Student Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};