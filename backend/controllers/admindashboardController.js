// controllers/admindashboardcontroller.js
import db from "../config/db.js";

/* =========================
   ADMIN DASHBOARD STATS
========================= */
export const getAdminDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[{ totalStudents }]] = await db.query("SELECT COUNT(*) AS totalStudents FROM students");
    const [[{ totalStaff }]] = await db.query(`
      SELECT COUNT(*) AS totalStaff 
      FROM users 
      WHERE role IN ('COUNSELLOR','COORDINATOR','HOD','WARDEN','WATCHMAN')
    `);
    const [[{ totalRoles }]] = await db.query("SELECT COUNT(DISTINCT role) AS totalRoles FROM users");

    res.json({
      success: true,
      stats: { totalUsers, totalStudents, totalStaff, totalRoles },
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   DEPARTMENTS WITH REPORTS
========================= */
export const getDepartmentsWithReports = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.name,
        d.display_name,
        COALESCE(s.student_count, 0) AS total_students,
        COALESCE(staff.staff_count, 0) AS total_staff,
        COALESCE(gp.gate_pass_count, 0) AS gate_pass_reports,
        COALESCE(od.on_duty_count, 0) AS on_duty_reports
      FROM departments d
      LEFT JOIN (
        SELECT department_id, COUNT(*) AS student_count
        FROM students
        GROUP BY department_id
      ) s ON s.department_id = d.id
      LEFT JOIN (
        SELECT department_id, COUNT(*) AS staff_count FROM (
          SELECT department_id, user_id FROM coordinators
          UNION ALL
          SELECT department_id, user_id FROM counsellors
          UNION ALL
          SELECT department_id, user_id FROM hods
        ) t
        GROUP BY department_id
      ) staff ON staff.department_id = d.id
      LEFT JOIN (
        SELECT st.department_id, COUNT(gpd.id) AS gate_pass_count
        FROM gate_pass_details gpd
        JOIN requests r ON r.id = gpd.request_id
        JOIN students st ON st.id = r.student_id
        GROUP BY st.department_id
      ) gp ON gp.department_id = d.id
      LEFT JOIN (
        SELECT st.department_id, COUNT(odd.id) AS on_duty_count
        FROM on_duty_details odd
        JOIN requests r ON r.id = odd.request_id
        JOIN students st ON st.id = r.student_id
        GROUP BY st.department_id
      ) od ON od.department_id = d.id
      ORDER BY d.name ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Departments with Reports Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};