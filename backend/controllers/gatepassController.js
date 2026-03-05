import db from "../config/db.js";
import { getIO } from "../config/socket.js";

import { sendStudentNotification } from "./notifications/staffNotificationController.js";
import { sendWhatsAppMessage } from "../services/whatsapp/whatsappService.js";

// ================= FETCH STUDENT INFO =================working fine
export const getStudentInfo = async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT u.username, u.register_number, u.email, u.phone, u.role,
              s.year_of_study AS year,
              s.guardian_name, s.guardian_address, s.guardian_mobile,
              s.hostel_name, s.room_number, s.student_type, s.section,
              s.father_name, s.father_mobile, s.mother_name, s.mother_mobile,
              d.name AS department
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE u.id = ?`,
      [studentId]
    );

    if (!rows.length) return res.status(404).json({ message: "Student not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= APPLY GATEPASS =================working fine

export const applyGatepass = async (req, res) => {
  const {
    student_id,
    from_date,
    to_date,
    out_time,
    reason,
    guardian_name,
    guardian_mobile,
    guardian_address,
  } = req.body;

  try {

    const [studentRows] = await db.query(
      `SELECT id, counsellor_id FROM students WHERE user_id = ?`,
      [student_id]
    );

    if (!studentRows.length)
      return res.status(404).json({ message: "Student not found" });

    const studentDbId = studentRows[0].id;
    const counsellorId = studentRows[0].counsellor_id;

    const [requestResult] = await db.query(
      `INSERT INTO requests 
       (student_id, request_type, status, current_stage)
       VALUES (?, 'GATE_PASS', 'SUBMITTED', 'COUNSELLOR')`,
      [studentDbId]
    );

    const requestId = requestResult.insertId;

    const totalDays =
      Math.floor(
        (new Date(to_date) - new Date(from_date)) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    await db.query(
      `INSERT INTO gate_pass_details
       (request_id, reason, out_time, from_date, to_date, time_of_leaving, total_days)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [requestId, reason, out_time, from_date, to_date, out_time, totalDays]
    );

    await db.query(
      `UPDATE students
       SET guardian_name = ?, guardian_mobile = ?, guardian_address = ?
       WHERE id = ?`,
      [guardian_name, guardian_mobile, guardian_address, studentDbId]
    );

    if (guardian_mobile) {
      const message = `RMK ZapOut Notification

Gate Pass Request Submitted

Student ID: ${student_id}
Reason: ${reason}
From: ${from_date}
To: ${to_date}
Out Time: ${out_time}

Your request is sent for counsellor approval.`;

      await sendWhatsAppMessage(guardian_mobile, message);
    }

    if (counsellorId) {
      const [counsellorRows] = await db.query(
        `SELECT user_id FROM counsellors WHERE id = ?`,
        [counsellorId]
      );

      if (counsellorRows.length) {
        const counsellorUserId = counsellorRows[0].user_id;

        await sendStudentNotification(
          counsellorUserId,
          student_id,
          null,
          "gate-pass"
        );

        const io = getIO();
        io.to(`user_${counsellorUserId}`).emit("newRequest", {
          requestType: "GATE_PASS",
          requestId,
        });
      }
    }

    res.status(201).json({
      message: "Gate Pass submitted successfully",
      requestId,
    });
  } catch (err) {
    console.error("Gatepass submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
};