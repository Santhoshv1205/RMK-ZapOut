
import db from "../config/db.js";

export const getDeoProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const [[user]] = await db.query(
      "SELECT id, username, email, phone, role FROM users WHERE id=? AND role='DEO' AND is_active=1",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "DEO not found" });
    }

    const [[deo]] = await db.query(
      `SELECT 
         d2.academic_type,
         dep.name AS department
       FROM deos d2
       LEFT JOIN departments dep ON d2.department_id = dep.id
       WHERE d2.user_id = ?`,
      [userId]
    );

    if (!deo) {
      return res.status(404).json({ message: "DEO details not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      academic_type: deo.academic_type,
      department: deo.department || null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch DEO profile" });
  }
};
export const updateDeoProfile = async (req, res) => {
  const { userId } = req.params;
  const { username, phone } = req.body;

  try {
    // Only allow updating username and phone
    await db.query(
      `UPDATE users 
       SET username = ?, phone = ?
       WHERE id = ? AND role = 'DEO'`,
      [username, phone, userId]
    );

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const getDeoRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Get DEO details
    const [[deo]] = await db.query(
      `SELECT department_id, academic_type 
       FROM deos 
       WHERE user_id = ?`,
      [userId]
    );

    if (!deo) return res.status(404).json({ message: "DEO not found" });

    let departmentCondition = "";
    let values = [];

    if (deo.academic_type === "CORE_DEPT") {
      departmentCondition = "AND st.department_id = ?";
      values.push(deo.department_id);
    }

    // 2️⃣ Fetch all requests
    const [requests] = await db.query(
      `
      SELECT 
        r.*,
        u.username AS student_name,
        u.email AS student_email,
        u.register_number,
        u.phone,
        st.*,
        d.name AS department,
        od.event_type,
        od.event_name,
        od.college,
        od.location,
        od.proof_file,
        od.from_date AS od_from_date,
        od.to_date AS od_to_date,
        od.total_days AS od_total_days,
        gp.reason,
        gp.out_time,
        gp.in_time,
        gp.from_date AS gp_from_date,
        gp.to_date AS gp_to_date,
        gp.total_days AS gp_total_days
      FROM requests r
      JOIN students st ON r.student_id = st.id
      JOIN users u ON st.user_id = u.id
      LEFT JOIN departments d ON st.department_id = d.id
      LEFT JOIN on_duty_details od ON od.request_id = r.id
      LEFT JOIN gate_pass_details gp ON gp.request_id = r.id
      WHERE 1=1
      ${departmentCondition}
      ORDER BY r.created_at DESC
      `,
      values
    );

    // 3️⃣ Separate On-Duty and Gate Pass
    const onDutyRequests = requests.filter((r) => r.request_type === "ON_DUTY");
    const gatePassRequests = requests.filter((r) => r.request_type === "GATE_PASS");

    res.json({ onDutyRequests, gatePassRequests });
  } catch (err) {
    console.error("DEO REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};


/* ===============================
   DEO DASHBOARD STATS
================================= */
export const getDeoDashboardStats = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Get DEO department + academic type
    const [[deo]] = await db.query(
      `SELECT department_id, academic_type
       FROM deos
       WHERE user_id = ?`,
      [userId]
    );

    if (!deo) {
      return res.status(404).json({ message: "DEO not found" });
    }

    // 2️⃣ Total Students
    let totalStudentsQuery = `SELECT COUNT(*) AS total_students FROM students`;
    let totalStudentsParams = [];

    if (deo.academic_type === "CORE_DEPT") {
      totalStudentsQuery += ` WHERE department_id = ?`;
      totalStudentsParams.push(deo.department_id);
    }

    const [[studentsCount]] = await db.query(totalStudentsQuery, totalStudentsParams);

    // 3️⃣ On-Duty Counts
   let odQuery = `
  SELECT 
    COUNT(*) AS total_od,
    SUM(CASE WHEN r.status IN ('SUBMITTED','COUNSELLOR_APPROVED','COORDINATOR_APPROVED') THEN 1 ELSE 0 END) AS pending_od,
    SUM(CASE WHEN r.status IN ('HOD_APPROVED','WARDEN_APPROVED') THEN 1 ELSE 0 END) AS approved_od
  FROM requests r
  JOIN students s ON r.student_id = s.id
  WHERE r.request_type = 'ON_DUTY'
`;
    let odParams = [];
    if (deo.academic_type === "CORE_DEPT") {
      odQuery += ` AND s.department_id = ?`;
      odParams.push(deo.department_id);
    }

    const [[odCount]] = await db.query(odQuery, odParams);

    // 4️⃣ Gatepass Counts
   let gpQuery = `
  SELECT 
    COUNT(*) AS total_gp,
    SUM(CASE WHEN r.status IN ('SUBMITTED','COUNSELLOR_APPROVED','COORDINATOR_APPROVED') THEN 1 ELSE 0 END) AS pending_gp,
    SUM(CASE WHEN r.status IN ('HOD_APPROVED','WARDEN_APPROVED') THEN 1 ELSE 0 END) AS approved_gp
  FROM requests r
  JOIN students s ON r.student_id = s.id
  WHERE r.request_type = 'GATE_PASS'
`;
    let gpParams = [];
    if (deo.academic_type === "CORE_DEPT") {
      gpQuery += ` AND s.department_id = ?`;
      gpParams.push(deo.department_id);
    }

    const [[gpCount]] = await db.query(gpQuery, gpParams);

    // 5️⃣ Academic Calendar
    const [academicCalendar] = await db.query(
      `SELECT * FROM academic_calendars ORDER BY uploaded_at DESC`
    );

    // ✅ Response
    res.json({
      totalStudents: studentsCount.total_students,
      odPending: odCount.pending_od,
      odApproved: odCount.approved_od,
      gatepassPending: gpCount.pending_gp,
      gatepassApproved: gpCount.approved_gp,
      academicCalendar,
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};