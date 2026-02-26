
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
     u.id,
     u.username,
     u.email,
     u.phone,
     u.role,
     d2.academic_type,
     dep.name AS department_code,
     dep.display_name AS department
   FROM users u
   JOIN deos d2 ON u.id = d2.user_id
   LEFT JOIN departments dep ON d2.department_id = dep.id
   WHERE u.id = ? AND u.role='DEO' AND u.is_active=1`,
      [userId]
    );
console.log("DEO FULL DATA:", deo);
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
    else if (deo.academic_type === "BASE_DEPT") {
  departmentCondition = "AND st.year_of_study = 1";
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
else if (deo.academic_type === "BASE_DEPT") {
  totalStudentsQuery += ` WHERE year_of_study = 1`;
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
else if (deo.academic_type === "BASE_DEPT") {
  odQuery += ` AND s.year_of_study = 1`;
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
else if (deo.academic_type === "BASE_DEPT") {
  gpQuery += ` AND s.year_of_study = 1`;
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

/* ==================================
   GET DEPARTMENT STUDENTS FOR DEO
================================== */
export const getDeoStudents = async (req, res) => {
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

 let condition = "";
let values = [];

if (deo.academic_type === "CORE_DEPT") {
  condition = "WHERE s.department_id = ?";
  values.push(deo.department_id);
}
else if (deo.academic_type === "BASE_DEPT") {
  condition = "WHERE s.year_of_study = 1";
}

    // 3️⃣ Fetch students
  const [students] = await db.query(
  `
  SELECT 
    s.id,
    u.username AS name,
    u.register_number,
    u.email,
    u.phone,

    d.display_name AS department,

    s.year_of_study,
    s.section,
    s.student_type,
    s.dob,
    s.address,
    s.permanent_address,

    s.father_name,
    s.father_mobile,
    s.mother_name,
    s.mother_mobile,
    s.guardian_name,
    s.guardian_mobile,

    s.hostel_name,
    s.room_number,
    s.bus_details,

    COALESCE(cu.username, co_u.username) AS assigned_staff

  FROM students s
  JOIN users u ON u.id = s.user_id
  JOIN departments d ON d.id = s.department_id

  LEFT JOIN counsellors c ON c.id = s.counsellor_id
  LEFT JOIN users cu ON cu.id = c.user_id

  LEFT JOIN coordinators co ON co.id = s.counsellor_id
  LEFT JOIN users co_u ON co_u.id = co.user_id

  ${condition}

  ORDER BY s.year_of_study, u.username
  `,
  values
);

    res.json({
      success: true,
      data: students,
    });

  } catch (error) {
    console.error("DEO STUDENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};