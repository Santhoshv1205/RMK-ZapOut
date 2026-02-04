import db from "../../config/db.js";
import { getIO } from "../../config/socket.js";

/**
 * Notify student when request status changes
 */
export const notifyStudentOnStatusChange = async (
  requestId,
  status,        // COUNSELLOR_APPROVED | COORDINATOR_APPROVED | HOD_APPROVED | WARDEN_APPROVED | REJECTED
  actedByRole    // COUNSELLOR | COORDINATOR | HOD | WARDEN
) => {
  try {
    // Get request + student user details
    const [rows] = await db.query(
      `SELECT 
         r.request_type,
         r.rejection_reason,
         u.id AS user_id
       FROM requests r
       JOIN students s ON s.id = r.student_id
       JOIN users u ON u.id = s.user_id
       WHERE r.id = ?`,
      [requestId]
    );

    if (!rows.length) return;

    const request = rows[0];

    let message = "";
    let type = "system";

    if (status === "REJECTED") {
      message = `Your ${request.request_type.replace("_", " ")} request was rejected by ${actedByRole}` +
        (request.rejection_reason
          ? ` (Reason: ${request.rejection_reason})`
          : "");
      type = "rejection";
    } else {
      const approvedBy = status.replace("_APPROVED", "").replace("_", " ");
      message = `Your ${request.request_type.replace("_", " ")} request was approved by ${approvedBy}`;
      type = "approval";
    }

    // Save notification
    const [result] = await db.query(
      "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
      [request.user_id, message, type]
    );

    // Emit via socket
    const io = getIO();
    io.to(`user_${request.user_id}`).emit("newNotification", {
      id: result.insertId,
      user_id: request.user_id,
      message,
      type,
      is_read: 0,
      created_at: new Date(),
    });

  } catch (err) {
    console.error("Student notification error:", err);
  }
};

export const sendStaffNotification = async (
  studentUserId,
  message,
  type
) => {
  try {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, message, type)
       VALUES (?, ?, ?)`,
      [studentUserId, message, type]
    );

    let label;
    if (type === "on-duty") label = "ON-DUTY";
    else if (type === "gate-pass") label = "GATE PASS";
    else label = "SYSTEM";
    const io = getIO();
    io.to(`user_${studentUserId}`).emit("newNotification", {
      id: result.insertId,
      user_id: studentUserId,
      message,
      type,
      is_read: 0,
      created_at: new Date(),
    });

  } catch (err) {
    console.error("sendStaffNotification error:", err);
  }
};