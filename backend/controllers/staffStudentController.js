import db from "../config/db.js";

/* =========================================
   GET DEPARTMENT STUDENTS
========================================= */
export const getDepartmentStudents = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) return res.json([]);
    if (!["COUNSELLOR", "COORDINATOR", "HOD"].includes(role))
      return res.json([]);

    /* 1️⃣ Get department of logged-in staff */
    let deptQuery = "";
    if (role === "COUNSELLOR")
      deptQuery = `SELECT department_id, academic_type FROM counsellors WHERE user_id = ?`;
    else if (role === "COORDINATOR")
      deptQuery = `SELECT department_id, academic_type FROM coordinators WHERE user_id = ?`;
    else if (role === "HOD")
      deptQuery = `SELECT department_id FROM hods WHERE user_id = ?`;

    const [deptRows] = await db.query(deptQuery, [userId]);
    if (deptRows.length === 0) return res.json([]);

    const departmentId = deptRows[0].department_id;
    const staffAcademicType = deptRows[0].academic_type || null;

    /* 2️⃣ Fetch students */
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

    s.counsellor_id,

    COALESCE(cu.username, co_u.username) AS assigned_staff

  FROM students s
  JOIN users u ON u.id = s.user_id
  JOIN departments d ON d.id = s.department_id

  LEFT JOIN counsellors c ON c.id = s.counsellor_id
  LEFT JOIN users cu ON cu.id = c.user_id

  LEFT JOIN coordinators co ON co.id = s.counsellor_id
  LEFT JOIN users co_u ON co_u.id = co.user_id

  WHERE s.department_id = ?
    AND (
      (? = 'BASE_DEPT' AND s.year_of_study = 1)
      OR (? = 'CORE_DEPT' AND s.year_of_study > 1)
      OR (? IS NULL)
    )

  ORDER BY s.year_of_study, u.username
  `,
  [departmentId, staffAcademicType, staffAcademicType, staffAcademicType]
);

    res.json(students);
  } catch (error) {
    console.error("getDepartmentStudents:", error);
    res.status(500).json([]);
  }
};

/* =========================================
   GET MY STUDENTS
========================================= */
export const getMyStudents = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !["COUNSELLOR", "COORDINATOR"].includes(role))
      return res.json([]);

    /* 1️⃣ Get staff table ID and academic_type */
    const [staffRows] = await db.query(
      `
      SELECT id, academic_type FROM counsellors WHERE user_id = ?
      UNION ALL
      SELECT id, academic_type FROM coordinators WHERE user_id = ?
      `,
      [userId, userId]
    );
    if (staffRows.length === 0) return res.json([]);

    const staffTableId = staffRows[0].id;
    const staffAcademicType = staffRows[0].academic_type;

    /* 2️⃣ Fetch assigned students */
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

    s.counsellor_id,

    COALESCE(cu.username, co_u.username) AS assigned_staff

  FROM students s
  JOIN users u ON u.id = s.user_id
  JOIN departments d ON d.id = s.department_id

  LEFT JOIN counsellors c ON c.id = s.counsellor_id
  LEFT JOIN users cu ON cu.id = c.user_id

  LEFT JOIN coordinators co ON co.id = s.counsellor_id
  LEFT JOIN users co_u ON co_u.id = co.user_id

  WHERE s.counsellor_id = ?
    AND (
      (? = 'BASE_DEPT' AND s.year_of_study = 1)
      OR (? = 'CORE_DEPT' AND s.year_of_study > 1)
      OR (? IS NULL)
    )

  ORDER BY s.year_of_study, u.username
  `,
  [staffTableId, staffAcademicType, staffAcademicType, staffAcademicType]
);


    res.json(students);
  } catch (error) {
    console.error("getMyStudents:", error);
    res.status(500).json([]);
  }
};

/* =========================================
   ASSIGN STUDENT
========================================= */
export const assignStudent = async (req, res) => {
  try {
    const { staffUserId } = req.body;
    const studentId = req.params.id;

    if (!staffUserId || !studentId)
      return res
        .status(400)
        .json({ success: false, message: "Missing studentId or staffUserId" });

    /* 1️⃣ Get staff info */
    const [staffRows] = await db.query(
      `
      SELECT id, academic_type FROM counsellors WHERE user_id = ?
      UNION ALL
      SELECT id, academic_type FROM coordinators WHERE user_id = ?
      `,
      [staffUserId, staffUserId]
    );
    if (staffRows.length === 0)
      return res
        .status(403)
        .json({
          success: false,
          message: "Only counsellor or coordinator can be assigned",
        });

    const staffTableId = staffRows[0].id;
    const staffAcademicType = staffRows[0].academic_type;

    /* 2️⃣ Get student year */
    const [studentRows] = await db.query(
      `SELECT year_of_study FROM students WHERE id = ?`,
      [studentId]
    );
    if (studentRows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const studentYear = studentRows[0].year_of_study;

    /* 3️⃣ Restrict 1st-year assignment */
    if (studentYear === 1 && staffAcademicType !== "BASE_DEPT") {
      return res.status(403).json({
        success: false,
        message: "Only BASE_DEPT staff can be assigned 1st-year students",
      });
    }

    /* 4️⃣ Assign student */
    await db.query(`UPDATE students SET counsellor_id = ? WHERE id = ?`, [
      staffTableId,
      studentId,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("assignStudent:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   UNASSIGN STUDENT
========================================= */
export const unassignStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!studentId)
      return res
        .status(400)
        .json({ success: false, message: "Missing studentId" });

    await db.query(`UPDATE students SET counsellor_id = NULL WHERE id = ?`, [
      studentId,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("unassignStudent:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
