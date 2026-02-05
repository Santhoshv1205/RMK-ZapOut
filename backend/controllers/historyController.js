import db from "../config/db.js";

export const getStudentHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    // Step 1: Get student.id from userId
    const [studentRows] = await db.query(
      `SELECT id FROM students WHERE user_id = ?`,
      [userId]
    );

    if (!studentRows.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = studentRows[0].id;

    // Step 2: Fetch all requests with their respective details
    const sql = `
      SELECT 
        r.id,
        r.request_type,
        r.status,
        r.rejected_by,
        r.rejection_reason,
        r.current_stage,
        r.created_at,

        gp.reason         AS gp_reason,
        gp.from_date      AS gp_from,
        gp.to_date        AS gp_to,
        gp.time_of_leaving AS gp_time_of_leaving,
        gp.out_time       AS gp_out_time,
        gp.in_time        AS gp_in_time,
        gp.total_days     AS gp_days,

        od.event_type     AS od_event_type,
        od.event_name     AS od_event_name,
        od.college        AS od_college,
        od.location       AS od_location,
        od.proof_file     AS od_proof_file,
        od.from_date      AS od_from,
        od.to_date        AS od_to,
        od.total_days     AS od_days

      FROM requests r
      LEFT JOIN gate_pass_details gp ON gp.request_id = r.id
      LEFT JOIN on_duty_details od ON od.request_id = r.id
      WHERE r.student_id = ?
      ORDER BY r.created_at DESC
    `;

    const [rows] = await db.query(sql, [studentId]);

    // Step 3: Map rows into frontend-friendly format
    const history = rows.map((r) => {
      const isGatePass = r.request_type === "GATE_PASS";

      return {
        id: r.id,
        type: isGatePass ? "Gate Pass" : "On-Duty",
        status:
          r.status === "REJECTED"
            ? "Rejected"
            : r.status.includes("APPROVED")
            ? "Approved"
            : "Pending",
        rejectedBy: r.rejected_by || "-",
        remark: r.rejection_reason || "-",
        createdAt: r.created_at,
        // Gate Pass Fields
        gp_reason: r.gp_reason || "-",
        gp_from: r.gp_from,
        gp_to: r.gp_to,
        gp_time_of_leaving: r.gp_time_of_leaving,
        gp_out_time: r.gp_out_time,
        gp_in_time: r.gp_in_time,
        gp_days: r.gp_days,
        // On-Duty Fields
        od_event_type: r.od_event_type || "-",
        od_event_name: r.od_event_name || "-",
        od_college: r.od_college || "-",
        od_location: r.od_location || "-",
        od_proof_file: r.od_proof_file || "-",
        od_from: r.od_from,
        od_to: r.od_to,
        od_days: r.od_days,
      };
    });

    res.json(history);
  } catch (err) {
    console.error("History Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= STAFF HISTORY =================
export const getStaffHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Get staff role
    const [[user]] = await db.query(
      `SELECT role FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.role; // COUNSELLOR | COORDINATOR | HOD | WARDEN

    // 2️⃣ Fetch requests relevant to this staff
    const sql = `
      SELECT
        r.id,
        r.request_type,
        r.status,
        r.rejected_by,
        r.rejection_reason,
        r.current_stage,
        DATE_FORMAT(r.created_at, '%d-%m-%Y %h:%i %p') AS created_at,

        u.username AS student_name,
        u.register_number,
        d.display_name AS department,

        -- Gate Pass Details
        gp.reason AS gp_reason,
        gp.from_date AS gp_from,
        gp.to_date AS gp_to,
        gp.total_days AS gp_total_days,

        -- On-Duty Details
        od.event_name AS od_event_name,
        od.from_date AS od_from,
        od.to_date AS od_to,
        od.total_days AS od_total_days

      FROM requests r
      JOIN students s ON s.id = r.student_id
      JOIN users u ON u.id = s.user_id
      JOIN departments d ON d.id = s.department_id
      LEFT JOIN gate_pass_details gp ON gp.request_id = r.id
      LEFT JOIN on_duty_details od ON od.request_id = r.id

      ORDER BY r.created_at DESC
    `;

    const [rows] = await db.query(sql);

    // 3️⃣ Map rows to frontend-friendly format
    const history = rows.map(r => {
      const isGatePass = r.request_type === "GATE_PASS";
      return {
        id: r.id,
        studentName: r.student_name,
        registerNo: r.register_number,
        department: r.department,

        requestType: isGatePass ? "Gate Pass" : "On-Duty",

        // Date range & total days
        fromDate: isGatePass ? r.gp_from : r.od_from,
        toDate: isGatePass ? r.gp_to : r.od_to,
        totalDays: isGatePass ? r.gp_total_days : r.od_total_days,

        // Reason / event
        event: isGatePass ? r.gp_reason || "-" : r.od_event_name || "-",

        // Status & remarks
        status:
          r.status === "REJECTED"
            ? "Rejected"
            : r.status.includes("APPROVED")
            ? "Approved"
            : "Pending",

        remarks: r.rejection_reason || "-",

        // Request creation date
        createdAt: r.created_at,
      };
    });

    res.json(history);
  } catch (err) {
    console.error("Staff History Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



