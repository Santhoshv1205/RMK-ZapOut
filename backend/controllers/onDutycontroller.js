import db from "../config/db.js";
import { getIO } from "../config/socket.js";
import cloudinary from "../config/cloudinary.js";
import { sendStudentNotification } from "./notifications/staffNotificationController.js";
/* ================== STUDENT PROFILE ================== working fine */
export const getStudentProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
         u.username, u.register_number, u.email, u.role,
         s.student_type, s.year_of_study, d.name AS department
       FROM users u
       JOIN students s ON s.user_id = u.id
       LEFT JOIN departments d ON d.id = s.department_id
       WHERE u.id = ?`,
      [userId],
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== APPLY ON-DUTY ================== working fine*/
export const applyOnDuty = async (req, res) => {
  const { userId, eventType, eventName, college, location, fromDate, toDate } =
    req.body;
let proofFileUrl = null;
console.log("FILE:", req.file);
if (req.file) {
  proofFileUrl = req.file.path; // cloudinary URL
}

  if (
    !userId ||
    !eventType ||
    !eventName ||
    !college ||
    !location ||
    !fromDate ||
    !toDate
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1️⃣ Verify user
    const [userRows] = await db.query(
      "SELECT id, role FROM users WHERE id = ? AND is_active = 1",
      [userId],
    );

    if (userRows.length === 0)
      return res.status(404).json({ message: "User not found" });
    if (userRows[0].role !== "STUDENT")
      return res.status(403).json({ message: "Only students can apply" });

    // 2️⃣ Get student record
    const [studentRows] = await db.query(
      "SELECT * FROM students WHERE user_id = ?",
      [userId],
    );
    if (studentRows.length === 0)
      return res.status(404).json({ message: "Student record missing" });

    const student = studentRows[0];
    const studentId = student.id;
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (to < from)
      return res.status(400).json({ message: "Invalid date range" });
    const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    // 3️⃣ Insert into requests table
    const [requestResult] = await db.query(
      "INSERT INTO requests (student_id, request_type) VALUES (?, 'ON_DUTY')",
      [studentId],
    );
    const requestId = requestResult.insertId;

    // 4️⃣ Insert into on_duty_details table
    await db.query(
      `INSERT INTO on_duty_details
      (request_id, event_type, event_name, college, location, proof_file, from_date, to_date, total_days)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId,
        eventType,
        eventName,
        college,
        location,
        proofFileUrl,
        fromDate,
        toDate,
        totalDays,
      ],
    );

    // 5️⃣ Notify counsellor
    if (student.counsellor_id) {
      const [cRows] = await db.query("SELECT * FROM counsellors WHERE id = ?", [
        student.counsellor_id,
      ]);

      if (cRows.length > 0) {
        const counsellor = cRows[0];

        // Make sure the counsellor exists in users table
        const [userCheck] = await db.query(
          "SELECT id FROM users WHERE id = ?",
          [counsellor.user_id],
        );


        if (userCheck.length > 0) {
          await sendStudentNotification(
  counsellor.user_id, // receiver (staff)
  userId,             // student userId
  null,
  "on-duty"
);

          const io = getIO();
          io.to(`user_${counsellor.user_id}`).emit("newRequest");
        } else {
          console.warn(
            `Counsellor user_id ${counsellor.user_id} not found in users table. Notification skipped.`,
          );
        }
      } else {
        console.warn("Counsellor record not found. Notification skipped.");
      }
    } else {
      console.warn("Student has no counsellor assigned. Notification skipped.");
    }

    res
      .status(201)
      .json({ message: "On-Duty applied successfully", requestId });
      console.log(req.file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
