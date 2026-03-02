import db from "../config/db.js";

/* =======================================================
   GET ADMIN REPORT (Summary + Full Requests)
   Endpoint: GET /api/admin/reports
======================================================= */
export const getAdminReport = async (req, res) => {
  try {
    const { type, fromDate, toDate } = req.query;

    let filterQuery = "WHERE 1=1";
    let values = [];

    // Filter by request type
    if (type && type !== "ALL") {
      filterQuery += " AND r.request_type = ?";
      values.push(type);
    }

    // Filter by date
    if (fromDate && toDate) {
      filterQuery += " AND DATE(r.created_at) BETWEEN ? AND ?";
      values.push(fromDate, toDate);
    }

    /* ================= FULL REQUEST DATA ================= */
   const [requests] = await db.query(
  `
  SELECT 
    r.id,
    r.request_type,
    r.status,
    r.created_at,
    u.username AS student_name,
    d.name AS department,
    s.year_of_study,
    s.section
  FROM requests r
  JOIN students s ON r.student_id = s.id
  JOIN users u ON s.user_id = u.id
  LEFT JOIN departments d ON s.department_id = d.id
  ${filterQuery}
  ORDER BY r.created_at DESC
  `,
  values
);

    /* ================= SUMMARY COUNTS ================= */
    const [summary] = await db.query(
      `
      SELECT
        COUNT(*) AS total,
        SUM(status = 'REJECTED') AS rejected,
        SUM(status IN (
          'COUNSELLOR_APPROVED',
          'COORDINATOR_APPROVED',
          'HOD_APPROVED',
          'WARDEN_APPROVED'
        )) AS approved,
        SUM(request_type = 'GATE_PASS') AS gatePass,
        SUM(request_type = 'ON_DUTY') AS onDuty
      FROM requests r
      ${filterQuery}
      `,
      values
    );

    res.status(200).json({
      summary: summary[0],
      requests,
    });

  } catch (error) {
    console.error("Admin Report Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};