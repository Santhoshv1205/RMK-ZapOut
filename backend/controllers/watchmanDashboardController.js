import db from "../config/db.js";

/*
=========================================
🔴 EXIT ENDPOINT
Fetch + Validate + Mark Exit
=========================================
*/
export const scanAndMarkExit = async (req, res) => {
  const { register_number } = req.params;

  try {
    // 1️⃣ Get student
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

    // 2️⃣ Get LATEST approved request where exit not marked
    const [gateRows] = await db.query(
      `SELECT gpd.id,
       gpd.reason,
       gpd.from_date,
       gpd.to_date,
       gpd.time_of_leaving,
       gpd.exit_datetime,
       gpd.entry_datetime
FROM requests r
JOIN gate_pass_details gpd ON r.id = gpd.request_id
WHERE r.student_id = ?
AND r.status = 'HOD_APPROVED'
AND gpd.exit_datetime IS NULL
ORDER BY gpd.id DESC
LIMIT 1`,
      [student.student_id]
    );

    if (gateRows.length === 0) {
      return res.json({
        message: "No Approved Gate Pass Pending for Exit",
      });
    }

    const gatePass = gateRows[0];

    // 3️⃣ Mark Exit
    await db.query(
      `UPDATE gate_pass_details
       SET exit_datetime = NOW()
       WHERE id = ?`,
      [gatePass.id]
    );

    return res.json({
      student,
      gatePass: {
        ...gatePass,
        exit_datetime: new Date(),
      },
      message: "Exit Marked Successfully",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};



/*
=========================================
🟢 ENTRY ENDPOINT
Fetch + Validate + Mark Entry
=========================================
*/
export const scanAndMarkEntry = async (req, res) => {
  const { register_number } = req.params;

  try {
    // 1️⃣ Get student
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

    // 2️⃣ Get LATEST approved request where exit marked but entry not marked
    const [gateRows] = await db.query(
      `SELECT gpd.id,
              gpd.reason,
              gpd.from_date,
              gpd.to_date,
              gpd.time_of_leaving,
              gpd.exit_datetime,
              gpd.entry_datetime
       FROM requests r
       JOIN gate_pass_details gpd ON r.id = gpd.request_id
       WHERE r.student_id = ?
       AND r.status = 'HOD_APPROVED'
       AND gpd.exit_datetime IS NOT NULL
       AND gpd.entry_datetime IS NULL
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [student.student_id]
    );

    if (gateRows.length === 0) {
      return res.json({
        message: "No Student Pending for Entry",
      });
    }

    const gatePass = gateRows[0];

    // 3️⃣ Mark Entry
    await db.query(
      `UPDATE gate_pass_details
       SET entry_datetime = NOW()
       WHERE id = ?`,
      [gatePass.id]
    );

    return res.json({
      student,
      gatePass: {
        ...gatePass,
        entry_datetime: new Date(),
      },
      message: "Entry Marked Successfully",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};