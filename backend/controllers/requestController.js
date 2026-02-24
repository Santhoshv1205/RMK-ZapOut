import db from "../config/db.js";
import { getIO } from "../config/socket.js";
import cloudinary from "../config/cloudinary.js";
import { sendStudentNotification } from "./notifications/staffNotificationController.js";
import { sendStaffNotification } from "./notifications/studentNotificationController.js";
import { notifyStageChange } from "../services/notificationservice/requestNotificationService.js";


export const notifyNextApprovers = async (nextStage, reqRow, requestId, approverId) => {
  const io = getIO();
  let users = [];
  let actionText = "";

  // Determine receivers and action text
  if (nextStage === "COORDINATOR") {
    const [coordRows] = await db.query(
      `SELECT c.user_id, u.username
       FROM coordinators c
       JOIN users u ON u.id = c.user_id
       WHERE c.department_id = ? AND c.year = ?`,
      [reqRow.department_id, reqRow.student_year]
    );

    users = coordRows.map(c => c.user_id);

    // Get counsellor name
    const [[counsellor]] = await db.query(
      `SELECT u.username 
       FROM users u 
       WHERE u.id = ?`,
      [reqRow.counsellor_user_id]
    );

    
  } else if (nextStage === "HOD") {
    const [hodRows] = await db.query(
      `SELECT h.user_id, u.username
       FROM hods h
       JOIN users u ON u.id = h.user_id
       WHERE h.department_id = ?`,
      [reqRow.department_id]
    );

    users = hodRows.map(h => h.user_id);

    // Get coordinator name
    const [[coordinator]] = await db.query(
      `SELECT u.username 
       FROM users u
       WHERE u.id = ?`,
      [approverId]
    );

  } else if (nextStage === "WARDEN") {
    const [[warden]] = await db.query(`SELECT user_id FROM wardens LIMIT 1`);
    if (warden?.user_id) users.push(warden.user_id);

    actionText = "HOD approved the request";
  }

  // Send notification to all receivers
  for (const userId of users) {
    await sendStudentNotification(
      userId,                     // coordinator / HOD
      reqRow.student_user_id,     // original student
      actionText,                 // who forwarded
     reqRow.request_type === "ON_DUTY" ? "on-duty" : "gate-pass"
  
    );

    io.to(`user_${userId}`).emit("newRequest");
  }
};





/* =====================================================
   STUDENT SIDE
===================================================== */

/* ================= FETCH ALL STUDENT REQUESTS ================= */
export const getAllStudentRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const [studentRows] = await db.query(
      `SELECT id FROM students WHERE user_id = ?`,
      [userId],
    );

    if (!studentRows.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = studentRows[0].id;

    const [requests] = await db.query(
      `SELECT 
        r.id,
        r.request_type,
        r.status,
        r.current_stage,
        r.rejected_by,
        r.rejection_reason,
        r.created_at,

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
      LEFT JOIN on_duty_details od ON od.request_id = r.id
      LEFT JOIN gate_pass_details gp ON gp.request_id = r.id
      WHERE r.student_id = ?
      ORDER BY r.created_at DESC`,
      [studentId],
    );

    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CANCEL REQUEST ================= */
export const cancelRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT status, request_type FROM requests WHERE id = ?`,
      [requestId],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (rows[0].status !== "SUBMITTED") {
      return res
        .status(403)
        .json({ message: "Only submitted requests can be cancelled" });
    }

    if (rows[0].request_type === "ON_DUTY") {
      await db.query(`DELETE FROM on_duty_details WHERE request_id = ?`, [
        requestId,
      ]);
    } else {
      await db.query(`DELETE FROM gate_pass_details WHERE request_id = ?`, [
        requestId,
      ]);
    }

    await db.query(`DELETE FROM requests WHERE id = ?`, [requestId]);

    res.json({ message: "Request cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE REQUEST ================= */
export const updateRequest = async (req, res) => {
  const { requestId } = req.params;
  const data = req.body;
let proofFileUrl = req.file ? req.file.path : null;

  try {
    const [rows] = await db.query(
      `SELECT status, request_type FROM requests WHERE id = ?`,
      [requestId],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (!["SUBMITTED", "REJECTED"].includes(rows[0].status)) {
      return res.status(403).json({ message: "Cannot update after approval" });
    }
     

    if (req.file) {
      proofFileUrl = req.file.path; // already Cloudinary URL
    }

    if (rows[0].request_type === "ON_DUTY") {
      const totalDays =
        Math.ceil(
          (new Date(data.toDate) - new Date(data.fromDate)) /
            (1000 * 60 * 60 * 24),
        ) + 1;

      await db.query(
        `UPDATE on_duty_details SET
          event_type = ?,
          event_name = ?,
          college = ?,
          location = ?,
          proof_file = IFNULL(?, proof_file),
          from_date = ?,
          to_date = ?,
          total_days = ?
        WHERE request_id = ?`,
        [
          data.eventType,
          data.eventName,
          data.college,
          data.location,
          proofFileUrl,
          data.fromDate,
          data.toDate,
          totalDays,
          requestId,
        ],
      );
    }  else {

  // 🔒 Convert "null" string to actual NULL
  const safeOutTime =
    !data.outTime || data.outTime === "null"
      ? null
      : data.outTime;

  const safeInTime =
    !data.inTime || data.inTime === "null"
      ? null
      : data.inTime;

  const safeFromDate =
    !data.fromDate || data.fromDate === "null"
      ? null
      : data.fromDate;

  const safeToDate =
    !data.toDate || data.toDate === "null"
      ? null
      : data.toDate;

  let totalDays = null;

  if (safeFromDate && safeToDate) {
    totalDays =
      Math.ceil(
        (new Date(safeToDate) - new Date(safeFromDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1;
  }

  await db.query(
    `UPDATE gate_pass_details SET
      reason = ?,
      out_time = ?,
      in_time = ?,
      from_date = ?,
      to_date = ?,
      total_days = ?
    WHERE request_id = ?`,
    [
      data.reason || null,
      safeOutTime,
      safeInTime,
      safeFromDate,
      safeToDate,
      totalDays,
      requestId,
    ],
  );
}  res.json({ message: "Request updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   STAFF SIDE
===================================================== */
/* ================= FETCH STAFF REQUESTS ================= */

export const getStaffRequests = async (req, res) => {
  const { staffId, role } = req.params;

  if (!staffId || !role) {
    return res.status(400).json({ message: "staffId or role missing" });
  }

  try {
    const baseSelect = `
      SELECT
        r.id,
        r.request_type,
        r.status,
        r.current_stage,
        r.rejected_by,
        r.rejection_reason,
        r.created_at,

        u.username AS student_name,
        u.register_number,

        s.id AS student_id,
        s.department_id,
        s.year_of_study,

        cs.user_id AS counsellor_user_id,

        od.event_type,
        od.event_name,
        od.college,
        od.location,
        od.from_date AS od_from_date,
        od.to_date AS od_to_date,
        od.total_days AS od_total_days,
        od.proof_file AS od_proof_file,

        gp.reason,
        gp.from_date AS gp_from_date,
        gp.to_date AS gp_to_date,
        gp.total_days AS gp_total_days

      FROM requests r
      JOIN students s ON r.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN counsellors cs ON cs.id = s.counsellor_id
      LEFT JOIN on_duty_details od ON od.request_id = r.id
      LEFT JOIN gate_pass_details gp ON gp.request_id = r.id
    `;

    let query = "";
    let params = [];

    /* ================= COUNSELLOR ================= */
   if (role === "COUNSELLOR") {
  query = `
    ${baseSelect}
    WHERE
      (
        -- Normal counsellor pending requests
        r.current_stage = 'COUNSELLOR'
        AND cs.user_id = ?
      )
      OR
      (
        -- Rejected by Coordinator or HOD, visible back to counsellor
        r.status = 'REJECTED'
        AND r.rejected_by IN ('COORDINATOR', 'HOD')
        AND cs.user_id = ?
      )
    ORDER BY r.created_at DESC
  `;
  params = [staffId, staffId];
}
 else if (role === "COORDINATOR") {
      /* ================= COORDINATOR ================= */
      query = `
    ${baseSelect}
    WHERE
      (
        -- Coordinator-level approval
        r.current_stage = 'COORDINATOR'
        AND EXISTS (
          SELECT 1
          FROM coordinators c
          WHERE c.user_id = ?
            AND c.department_id = s.department_id
            AND c.year = s.year_of_study
        )
      )
      OR
      (
        -- Counsellor-level stage visible to coordinator IF student year matches coordinator year
        r.current_stage = 'COUNSELLOR'
        AND EXISTS (
          SELECT 1
          FROM coordinators c
          WHERE c.user_id = ?
            AND c.year = s.year_of_study
            AND c.id=s.counsellor_id
        )
      )
      OR
      (
        -- Counsellor-stage requests visible IF student.counsellor_id matches coordinator.id
        r.current_stage = 'COUNSELLOR'
        AND EXISTS (
          SELECT 1
          FROM coordinators c
          WHERE c.user_id = ?
            AND c.id = s.counsellor_id
        )
      )
    ORDER BY r.created_at DESC
  `;
      params = [staffId, staffId, staffId];
    } else if (role === "HOD") {
      /* ================= HOD ================= */
      query = `
        ${baseSelect}
        JOIN hods h ON h.user_id = ?
        WHERE r.current_stage = 'HOD'
          AND h.department_id = s.department_id
        ORDER BY r.created_at DESC
      `;
      params = [staffId];
    } else if (role === "WARDEN") {
      /* ================= WARDEN ================= */
      query = `
        ${baseSelect}
        WHERE r.current_stage = 'WARDEN'
        ORDER BY r.created_at DESC
      `;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [rows] = await db.query(query, params);

    /* ================= ACTIONABLE FLAG ================= */
    const requests = rows.map((r) => {
      let actionable = false;

      if (role === "COUNSELLOR" && r.current_stage === "COUNSELLOR") {
        actionable = true;
      }

      if (role === "COORDINATOR") {
        if (r.current_stage === "COORDINATOR") actionable = true;

        if (
          r.current_stage === "COUNSELLOR" &&
          r.counsellor_user_id == staffId
        ) {
          actionable = true; // counsellor-level approval
        }
      }

      if (role === "HOD" && r.current_stage === "HOD") actionable = true;
      if (role === "WARDEN" && r.current_stage === "WARDEN") actionable = true;

      return { ...r, actionable };
    });

    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE REQUEST STATUS (APPROVE/REJECT) ================= */

export const updateRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { role, action, staffId, rejectionReason } = req.body;

  let nextStage = null;
  let nextStatus   = null;

  try {
  const [[reqRow]] = await db.query(
  `SELECT
  r.current_stage,
  r.status,
  r.rejected_by,
  r.request_type,

  s.year_of_study AS student_year,
  s.user_id AS student_user_id,
  s.department_id,

  u.username AS student_name,
  u.register_number,

  d.name AS department_name,

  COALESCE(cs.user_id, cc.user_id) AS counsellor_user_id,
  co.user_id AS coordinator_user_id

FROM requests r
JOIN students s ON r.student_id = s.id
JOIN users u ON s.user_id = u.id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN counsellors cs ON cs.id = s.counsellor_id
LEFT JOIN coordinators cc ON cc.id = s.counsellor_id
LEFT JOIN coordinators co
  ON co.department_id = s.department_id
 AND co.year = s.year_of_study
WHERE r.id = ?
`,
  [requestId]
);



    if (!reqRow) {
      return res.status(404).json({ message: "Request not found" });
    }
    

 /* ===================== REJECT ===================== */
if (action === "REJECT") {

  let effectiveRole = role;
  let returnStage = "COUNSELLOR";

  // 🔥 Determine effective role (dual-role safe)
  if (
    role === "COORDINATOR" &&
    reqRow.current_stage === "COUNSELLOR" &&
    reqRow.counsellor_user_id == staffId
  ) {
    effectiveRole = "COUNSELLOR";
  }

  // 🔁 Determine return stage
  switch (effectiveRole) {
    case "COUNSELLOR":
      returnStage = "COUNSELLOR";
      break;

    case "COORDINATOR":
      returnStage = "COUNSELLOR";
      break;

    case "HOD":
      returnStage = "COORDINATOR";
      break;

    case "WARDEN":
      returnStage = "HOD";
      break;
  }

  await db.query(
    `UPDATE requests
     SET
       status = 'REJECTED',
       rejected_by = ?,
       rejection_reason = ?,
       current_stage = ?
     WHERE id = ?`,
    [effectiveRole, rejectionReason || null, returnStage, requestId]
  );

  // Student notification
  const studentMessage =
    `Your ${reqRow.request_type.replace("_", " ").toLowerCase()} request was rejected by ${role}` +
    (rejectionReason ? ` (Reason: ${rejectionReason})` : "");

  await sendStaffNotification(
    reqRow.student_user_id,
    studentMessage,
    reqRow.request_type === "ON_DUTY" ? "on-duty" : "gate-pass"
  );

  // 🔥 Notify previous stage staff
  const roleOrder = ["COUNSELLOR", "COORDINATOR", "HOD", "WARDEN"];
  const rejectIndex = roleOrder.indexOf(role);
  const previousStages = roleOrder.slice(0, rejectIndex); // stages before the rejecting role

  const staffMap = {
    COUNSELLOR: reqRow.counsellor_user_id,
    COORDINATOR: reqRow.coordinator_user_id, // make sure you select this in query
    HOD: reqRow.hod_user_id,
    WARDEN: reqRow.warden_user_id,
  };

  const formattedType = reqRow.request_type.replace("_", " ");
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

  for (const stage of previousStages) {
    if (staffMap[stage]) {
      const msg =
        `${roleLabel} rejected this ${formattedType} request for ` +
        `${reqRow.student_name} (` +
        `${reqRow.department_name} - ${reqRow.student_year} Year, ` +
        `Reg: ${reqRow.register_number})` +
        (rejectionReason ? ` (Reason: ${rejectionReason})` : "");

      await sendStudentNotification(
        staffMap[stage],           // receiver (staff of previous stage)
        reqRow.student_user_id,    // student id
        roleLabel,                 // role who rejected
        reqRow.request_type === "ON_DUTY" ? "on-duty" : "gate-pass",
        msg
      );
    }
  }

  return res.json({ message: "Rejected successfully" });
}

/* ===================== APPROVE ===================== */
if (action === "APPROVE") {

  /* =====================================================
     EFFECTIVE COUNSELLOR (Normal / Dual-role)
  ===================================================== */

  if (
    reqRow.current_stage === "COUNSELLOR" &&
    (
      role === "COUNSELLOR" ||
      (role === "COORDINATOR" && reqRow.counsellor_user_id == staffId)
    )
  ) {

    // 🔥 AUTO-SKIP LOGIC
    const isAlsoCoordinator =
      role === "COORDINATOR" &&
      reqRow.coordinator_user_id == staffId;

    if (isAlsoCoordinator) {
      // One person = counsellor + coordinator
      nextStage = "HOD";
      nextStatus = "COORDINATOR_APPROVED";
    } else {
      // Only counsellor approval
      nextStage = "COORDINATOR";
      nextStatus = "COUNSELLOR_APPROVED";
    }
  }
  

  /* =====================================================
     EFFECTIVE COORDINATOR (Normal flow)
  ===================================================== */

  else if (
    role === "COORDINATOR" &&
    reqRow.current_stage === "COORDINATOR"
  ) {
    nextStage = "HOD";
    nextStatus = "COORDINATOR_APPROVED";
  }

  /* ---------- HOD ---------- */
  else if (role === "HOD" && reqRow.current_stage === "HOD") {
    nextStage = "WARDEN";
    nextStatus = "HOD_APPROVED";
    
  }

  /* ---------- WARDEN ---------- */
  else if (role === "WARDEN" && reqRow.current_stage === "WARDEN") {
    nextStage = "COMPLETED";
    nextStatus = "WARDEN_APPROVED";
  }

  if (!nextStage || !nextStatus) {
    return res.status(403).json({ message: "Invalid approval action" });
  }

  await db.query(
    `UPDATE requests
     SET status = ?, current_stage = ?
     WHERE id = ?`,
    [nextStatus, nextStage, requestId]
  );
  /* ================= WHATSAPP TRIGGER ================= */

/* ================= WHATSAPP TRIGGER ================= */

try {

  // 🔹 Counsellor approving at counsellor stage
  if (
    reqRow.current_stage === "COUNSELLOR" &&
    (role === "COUNSELLOR" ||
     (role === "COORDINATOR" && reqRow.counsellor_user_id == staffId))
  ) {
    await notifyStageChange(requestId, "COUNSELLOR_APPROVED");
  }

  // 🔹 HOD approving at HOD stage
  if (
    reqRow.current_stage === "HOD" &&
    role === "HOD"
  ) {
    await notifyStageChange(requestId, "HOD_APPROVED");
  }

} catch (err) {
  console.error("WhatsApp notification failed:", err.message);
}
  /* -------- STUDENT NOTIFICATION -------- */
  const nextApproverLabel =
    nextStage === "COMPLETED" ? "final approval" : nextStage;

  const studentMessage =
    `Your ${reqRow.request_type.replace("_", " ").toLowerCase()} request ` +
    `was approved by ${role} and forwarded to ${nextApproverLabel}`;

  await sendStaffNotification(
    reqRow.student_user_id,
    studentMessage,
    reqRow.request_type === "ON_DUTY" ? "on-duty" : "gate-pass"
  );

  /* -------- STAFF NOTIFICATION -------- */
  await notifyNextApprovers(
    nextStage,
    reqRow,
    requestId,
    staffId
  );

  return res.json({ message: "Approved successfully" });
}


    return res.status(400).json({ message: "Invalid action" });

  } catch (err) {
    console.error("updateRequestStatus:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

