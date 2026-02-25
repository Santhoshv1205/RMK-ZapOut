import db from "../config/db.js";
import bcrypt from "bcryptjs";

/* ================= CREATE STAFF ================= */
export const createStaff = async (req, res) => {
  const { adminId, username, email, phone, role, department, year, academic_type } = req.body;

  if (!adminId || !username || !email || !role || !academic_type)
    return res.status(400).json({ message: "Missing fields" });

  if (role === "COORDINATOR" && ![1, 2, 3, 4].includes(year))
    return res.status(400).json({ message: "Coordinator year must be 1–4" });

  const conn = await db.getConnection();
  try {
    const [[admin]] = await conn.query(
      "SELECT role FROM users WHERE id=? AND is_active=1",
      [adminId]
    );
    if (!admin || admin.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    await conn.beginTransaction();

    const [[existingUser]] = await conn.query(
      "SELECT id FROM users WHERE email=? OR phone=?",
      [email, phone]
    );
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    // Check HOD rules
    if (role === "HOD") {
      if (academic_type === "BASE_DEPT") {
        const [baseHod] = await conn.query(
          "SELECT id FROM hods WHERE academic_type='BASE_DEPT'"
        );
        if (baseHod.length > 0)
          return res.status(409).json({ message: "BASE_DEPT HOD already exists" });
      } else if (academic_type === "CORE_DEPT") {
        if (!department) return res.status(400).json({ message: "Department required for CORE_DEPT HOD" });
        const [[dept]] = await conn.query("SELECT id FROM departments WHERE name=?", [department]);
        if (!dept) return res.status(400).json({ message: "Invalid department" });

        const [coreHod] = await conn.query(
          "SELECT id FROM hods WHERE department_id=? AND academic_type='CORE_DEPT'",
          [dept.id]
        );
        if (coreHod.length > 0)
          return res.status(409).json({ message: `CORE_DEPT HOD already exists for ${department}` });
      }
    }

    // Check DEO rules
if (role === "DEO") {

  if (academic_type === "BASE_DEPT") {

    const [baseDeo] = await conn.query(
      "SELECT id FROM deos WHERE academic_type='BASE_DEPT'"
    );

    if (baseDeo.length > 0)
      return res.status(409).json({
        message: "BASE_DEPT DEO already exists"
      });

  } else if (academic_type === "CORE_DEPT") {

    if (!department)
      return res.status(400).json({
        message: "Department required for CORE_DEPT DEO"
      });

    const [[dept]] = await conn.query(
      "SELECT id FROM departments WHERE name=?",
      [department]
    );

    if (!dept)
      return res.status(400).json({
        message: "Invalid department"
      });

    const [coreDeo] = await conn.query(
      "SELECT id FROM deos WHERE department_id=? AND academic_type='CORE_DEPT'",
      [dept.id]
    );

    if (coreDeo.length > 0)
      return res.status(409).json({
        message: `CORE_DEPT DEO already exists for ${department}`
      });
  }
}

    // Coordinator department check
    let deptId = null;
    if (["COORDINATOR", "HOD", "COUNSELLOR", "DEO"].includes(role) && department) {
      const [[dept]] = await conn.query("SELECT id FROM departments WHERE name=?", [department]);
      if (!dept) throw new Error("Invalid department");
      deptId = dept.id;
    }

    const hash = await bcrypt.hash("Welcome@123", 10);
    const [user] = await conn.query(
      `INSERT INTO users (username,email,phone,password_hash,role,is_active)
       VALUES (?,?,?,?,?,1)`,
      [username, email, phone, hash, role]
    );

    if (role === "COORDINATOR") {
      await conn.query(
        `INSERT INTO coordinators (user_id, department_id, year, academic_type)
         VALUES (?, ?, ?, ?)`,
        [user.insertId, deptId, year, academic_type]
      );
    }

    if (role === "HOD") {
      await conn.query(
        `INSERT INTO hods (user_id, department_id, academic_type)
         VALUES (?, ?, ?)`,
        [user.insertId, deptId, academic_type]
      );
    }
    if (role === "DEO") {
  let deoDeptId = null;

  if (academic_type === "CORE_DEPT") {
    deoDeptId = deptId; // already fetched above
  }

  await conn.query(
    `INSERT INTO deos (user_id, department_id, academic_type)
     VALUES (?, ?, ?)`,
    [user.insertId, deoDeptId, academic_type]
  );
}

    if (role === "COUNSELLOR") {
      await conn.query(
        `INSERT INTO counsellors (user_id, department_id, academic_type)
         VALUES (?, ?, ?)`,
        [user.insertId, deptId, academic_type]
      );
    }
    

    await conn.commit();
    res.status(201).json({ message: "Staff created successfully" });
  } 
  
  catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};

/* ================= UPDATE STAFF ================= */
export const updateStaff = async (req, res) => {
  const staffId = req.params.id;
  const { adminId, username, email, phone, role, department, year, academic_type } = req.body;

  if (!academic_type)
    return res.status(400).json({ message: "Academic type required" });

  if (role === "COORDINATOR" && ![1, 2, 3, 4].includes(year))
    return res.status(400).json({ message: "Invalid coordinator year" });

  const conn = await db.getConnection();
  try {
    const [[admin]] = await conn.query(
      "SELECT role FROM users WHERE id=? AND is_active=1",
      [adminId]
    );
    if (!admin || admin.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    await conn.beginTransaction();

    const [[dup]] = await conn.query(
      "SELECT id FROM users WHERE (email=? OR phone=?) AND id<>?",
      [email, phone, staffId]
    );
    if (dup) return res.status(409).json({ message: "Duplicate email or phone" });

    // HOD rules
    if (role === "HOD") {
      if (academic_type === "BASE_DEPT") {
        const [baseHod] = await conn.query(
          "SELECT id FROM hods WHERE academic_type='BASE_DEPT' AND user_id<>?",
          [staffId]
        );
        if (baseHod.length > 0)
          return res.status(409).json({ message: "BASE_DEPT HOD already exists" });
      } else if (academic_type === "CORE_DEPT") {
        if (!department) return res.status(400).json({ message: "Department required for CORE_DEPT HOD" });
        const [[dept]] = await conn.query("SELECT id FROM departments WHERE name=?", [department]);
        if (!dept) return res.status(400).json({ message: "Invalid department" });

        const [coreHod] = await conn.query(
          "SELECT id FROM hods WHERE department_id=? AND academic_type='CORE_DEPT' AND user_id<>?",
          [dept.id, staffId]
        );
        if (coreHod.length > 0)
          return res.status(409).json({ message: `CORE_DEPT HOD already exists for ${department}` });
      }
    }// DEO rules
if (role === "DEO") {
  if (academic_type === "BASE_DEPT") {
    const [baseDeo] = await conn.query(
      "SELECT id FROM deos WHERE academic_type='BASE_DEPT' AND user_id<>?",
      [staffId]
    );

    if (baseDeo.length > 0)
      return res.status(409).json({
        message: "BASE_DEPT DEO already exists"
      });

  } else if (academic_type === "CORE_DEPT") {

    if (!department)
      return res.status(400).json({
        message: "Department required for CORE_DEPT DEO"
      });

    const [[dept]] = await conn.query(
      "SELECT id FROM departments WHERE name=?",
      [department]
    );

    if (!dept)
      return res.status(400).json({
        message: "Invalid department"
      });

    const [coreDeo] = await conn.query(
      "SELECT id FROM deos WHERE department_id=? AND academic_type='CORE_DEPT' AND user_id<>?",
      [dept.id, staffId]
    );

    if (coreDeo.length > 0)
      return res.status(409).json({
        message: `CORE_DEPT DEO already exists for ${department}`
      });
  }
}

    let deptId = null;
    if (department) {
      const [[dept]] = await conn.query("SELECT id FROM departments WHERE name=?", [department]);
      deptId = dept ? dept.id : null;
    }

    await conn.query(
      "UPDATE users SET username=?, email=?, phone=?, role=? WHERE id=?",
      [username, email, phone, role, staffId]
    );

    await conn.query("DELETE FROM coordinators WHERE user_id=?", [staffId]);
    await conn.query("DELETE FROM hods WHERE user_id=?", [staffId]);
    await conn.query("DELETE FROM counsellors WHERE user_id=?", [staffId]);
    await conn.query("DELETE FROM deos WHERE user_id=?", [staffId]);

    if (role === "COORDINATOR") {
      await conn.query(
        `INSERT INTO coordinators (user_id, department_id, year, academic_type)
         VALUES (?, ?, ?, ?)`,
        [staffId, deptId, year, academic_type]
      );
    }
    if (role === "HOD") {
      await conn.query(
        `INSERT INTO hods (user_id, department_id, academic_type)
         VALUES (?, ?, ?)`,
        [staffId, deptId, academic_type]
      );
    }
    if (role === "COUNSELLOR") {
      await conn.query(
        `INSERT INTO counsellors (user_id, department_id, academic_type)
         VALUES (?, ?, ?)`,
        [staffId, deptId, academic_type]
      );
    }
    if (role === "DEO") {
  let deoDeptId = null;

  if (academic_type === "CORE_DEPT") {
    deoDeptId = deptId;
  }

  await conn.query(
    `INSERT INTO deos (user_id, department_id, academic_type)
     VALUES (?, ?, ?)`,
    [staffId, deoDeptId, academic_type]
  );
}

    await conn.commit();
    res.json({ message: "Staff updated successfully" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};

/* ================= DELETE STAFF ================= */
export const deleteStaff = async (req, res) => {
  const { id } = req.params;
  const { adminId } = req.query;

  const conn = await db.getConnection();
  try {
    const [[admin]] = await conn.query(
      "SELECT role FROM users WHERE id=? AND is_active=1",
      [adminId]
    );
    if (!admin || admin.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    await conn.beginTransaction();
    await conn.query("DELETE FROM counsellors WHERE user_id=?", [id]);
    await conn.query("DELETE FROM coordinators WHERE user_id=?", [id]);
    await conn.query("DELETE FROM hods WHERE user_id=?", [id]);
    await conn.query("DELETE FROM users WHERE id=?", [id]);

    await conn.commit();
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  } finally {
    conn.release();
  }
};

/* ================= GET STAFFS ================= */
export const getStaffs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id, u.username, u.email, u.phone, u.role, u.is_active,
        d.name AS department,
        co.year AS coordinator_year,
        COALESCE(co.academic_type, c.academic_type, h.academic_type,d2.academic_type) AS academic_type
      FROM users u
      LEFT JOIN counsellors c ON u.id = c.user_id
      LEFT JOIN coordinators co ON u.id = co.user_id
      LEFT JOIN hods h ON u.id = h.user_id
       LEFT JOIN deos d2 ON u.id = d2.user_id
      LEFT JOIN departments d ON d.id = COALESCE(c.department_id, co.department_id, h.department_id, d2.department_id)
      WHERE u.role <> 'STUDENT'
      ORDER BY u.role, u.username
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch staff list" });
  }
};
