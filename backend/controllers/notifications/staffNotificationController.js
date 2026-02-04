import db from "../../config/db.js";
import { getIO } from "../../config/socket.js";

/* ================= FETCH ================= */

// Fetch notifications for a user
export const getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

/* ================= MARK READ ================= */

// Mark single notification as read
export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [
      userId,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Mark all read error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

/* ================= CLEAR ================= */

// Delete all notifications for a user
export const clearAllNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Clear notifications error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

/* ================= SMART NOTIFICATION ================= */

// Send notification with student full details
export const sendStudentNotification = async (
  receiverUserId,
  studentId,
  forwarderName,    // who forwarded (counsellor / coordinator)
  type   ,
  customMessage = null            // on-duty / gate-pass / system
) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         u.username,
         u.register_number,
         s.year_of_study,
         d.name AS department
       FROM users u
       JOIN students s ON s.user_id = u.id
       LEFT JOIN departments d ON d.id = s.department_id
       WHERE u.id = ?`,
      [studentId]
    );

    if (!rows.length) return;

    const student = rows[0];

    let label;
    if (type === "on-duty") label = "ON-DUTY";
    else if (type === "gate-pass") label = "GATE PASS";
    else label = "SYSTEM";

 const message = customMessage
  ? customMessage                                 // ✅ USE REJECTION TEXT
  : forwarderName
    ? `${forwarderName} forwarded this request for ${student.username} (${student.department} - ${student.year_of_study} Year, Reg: ${student.register_number})`
    : `${type === "on-duty"
        ? "New On-Duty request submitted"
        : "New Gate Pass request submitted"} by ${student.username} (${student.department} - ${student.year_of_study} Year, Reg: ${student.register_number})`;

    const [result] = await db.query(
      "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
      [receiverUserId, message, type]
    );

    const io = getIO();
    io.to(`user_${receiverUserId}`).emit("newNotification", {
      id: result.insertId,
      user_id: receiverUserId,
      message,
      type,
      label,
      is_read: 0,
      created_at: new Date(),
    });
  } catch (err) {
    console.error("Send notification error:", err);
  }
};





/* ================= BASIC SYSTEM NOTIFICATION ================= */

// Old helper (keep for admin/system alerts)
export const sendNotification = async (userId, message, type = "system") => {
  try {
    const [result] = await db.query(
      "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
      [userId, message, type],
    );

    const notification = {
      id: result.insertId,
      user_id: userId,
      message,
      type,
      is_read: 0,
      created_at: new Date(),
    };

    const io = getIO();
    io.to(`user_${userId}`).emit("newNotification", notification);
  } catch (err) {
    console.error("System notification error:", err);
  }
};
