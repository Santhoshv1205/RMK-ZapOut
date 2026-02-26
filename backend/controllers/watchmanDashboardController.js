import db from "../config/db.js";

export const getStudentByRegisterNumber = async (req, res) => {
  const { register_number } = req.params;

  try {
    // 1️⃣ Get student basic info
    const [studentRows] = await db.query(
      `SELECT s.id AS student_id,
              u.register_number,
              u.username AS name,
              d.name AS department,
              s.year_of_study
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN departments d ON d.id = s.department_id
       WHERE u.register_number = ?`,
      [register_number]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentRows[0];

    // 2️⃣ Check for HOD Approved Gate Pass only
    const [requestRows] = await db.query(
      `SELECT * FROM requests
       WHERE student_id = ?
       AND request_type = 'GATE_PASS'
       AND status = 'HOD_APPROVED'
       ORDER BY created_at DESC
       LIMIT 1`,
      [student.student_id]
    );

    if (requestRows.length === 0) {
      return res.json({
        student,
        approved: false,
        message: "No HOD Approved Gate Pass Found",
      });
    }

    const request = requestRows[0];

    // 3️⃣ Fetch gate pass details
    const [gateRows] = await db.query(
      `SELECT reason, from_date, to_date, time_of_leaving
       FROM gate_pass_details
       WHERE request_id = ?`,
      [request.id]
    );

    return res.json({
      student,
      approved: true,
      gatePass: gateRows[0] || null,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};