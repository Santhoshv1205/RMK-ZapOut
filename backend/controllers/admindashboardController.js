// controllers/admindashboardcontroller.js
import db from "../config/db.js";
// controllers/admindashboardController.js
import cloudinary from "../config/cloudinary.js"; // make sure path is correct
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


/* =========================
   ACADEMIC CALENDAR UPLOAD
========================= */
export const uploadAcademicCalendar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const proofFileUrl = req.file.path; // Cloudinary URL

    // Insert new calendar into DB
    const [result] = await db.query(
      "INSERT INTO academic_calendars (filename, cloud_url, uploaded_by) VALUES (?, ?, ?)",
      [req.file.originalname, proofFileUrl, 1] // uploaded_by = admin id
    );

    // Get all calendars sorted by uploaded_at ascending (oldest first)
    const [allCalendars] = await db.query(
      "SELECT id, cloud_url FROM academic_calendars ORDER BY uploaded_at ASC"
    );

    // Keep only 5 most recent files
    if (allCalendars.length > 5) {
      const excess = allCalendars.length - 5;
      for (let i = 0; i < excess; i++) {
        const oldCalendar = allCalendars[i];

        // Extract public_id from Cloudinary URL
        const parts = oldCalendar.cloud_url.split("/");
        const fileName = parts[parts.length - 1];
        const publicId = `rmkzapout/files/${fileName.split(".")[0]}`;

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

        // Delete from DB
        await db.query("DELETE FROM academic_calendars WHERE id = ?", [oldCalendar.id]);
      }
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: { id: result.insertId, url: proofFileUrl, filename: req.file.originalname },
    });
  } catch (err) {
    console.error("Upload Calendar Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   GET ALL CALENDARS
========================= */
export const getAcademicCalendars = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, filename, cloud_url, uploaded_at FROM academic_calendars ORDER BY uploaded_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Calendars Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// DELETE ACADEMIC CALENDAR
export const deleteAcademicCalendar = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch calendar info
    const [rows] = await db.query(
      "SELECT cloud_url FROM academic_calendars WHERE id = ?",
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "Calendar not found" });
    }

    const cloudUrl = rows[0].cloud_url;

    // Extract public_id from Cloudinary URL
    // Example URL: https://res.cloudinary.com/<cloud_name>/raw/upload/v1771748471/rmkzapout/files/1771748468467-RMK Academic Calendar.xls
    const parts = cloudUrl.split("/");
    const fileName = parts[parts.length - 1]; // e.g., '1771748468467-RMK Academic Calendar.xls'
    const publicId = `rmkzapout/files/${fileName.split(".")[0]}`; // remove extension

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // Delete from database
    await db.query("DELETE FROM academic_calendars WHERE id = ?", [id]);

    res.json({ success: true, message: "Calendar deleted successfully" });
  } catch (err) {
    console.error("Delete Calendar Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};