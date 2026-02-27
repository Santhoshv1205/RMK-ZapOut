import db from "../config/db.js"; // your MySQL connection
import bcrypt from "bcryptjs";
// GET all watchmen
export const getWatchmans = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, username, email, is_active FROM watchmans");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch watchmen" });
  }
};



/* ================= CREATE WATCHMAN ================= */
export const createWatchman = async (req, res) => {
  const { username, email, is_active = 1 } = req.body;

  if (!username || !email)
    return res.status(400).json({ message: "Username and email are required" });

  try {
    // 1️⃣ Check if email already exists in users
    const [existing] = await db.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    // 2️⃣ Default password for first login
    const defaultPassword = "rmk12345"; // temporary, force reset on first login
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // 3️⃣ Insert into users table
    const [result] = await db.query(
      `INSERT INTO users (username, email, password_hash, role, is_first_login, is_active)
       VALUES (?, ?, ?, 'WATCHMAN', 1, ?)`,
      [username, email, hashedPassword, is_active]
    );

    const userId = result.insertId;

    // 4️⃣ Optionally insert into watchmans table
    await db.query(
      `INSERT INTO watchmans (id, username, email, is_active)
       VALUES (?, ?, ?, ?)`,
      [userId, username, email, is_active]
    );

    res.status(201).json({
      message: "Watchman created successfully",
      watchman: { id: userId, username, email, is_active: !!is_active },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE a watchman
export const updateWatchman = async (req, res) => {
  const { id } = req.params;
  const { username, email, is_active } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: "Username and Email are required" });
  }

  try {
    await db.query(
      "UPDATE watchmans SET username=?, email=?, is_active=? WHERE id=?",
      [username, email, is_active ? 1 : 0, id]
    );
    res.json({ id, username, email, is_active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update watchman" });
  }
};

// DELETE a watchman
export const deleteWatchman = async (req, res) => {
  const { id } = req.params;
  try {
    // delete from watchmans
    await db.query("DELETE FROM watchmans WHERE id=?", [id]);

    // delete from users
    await db.query("DELETE FROM users WHERE id=? AND role='WATCHMAN'", [id]);

    res.json({ message: "Watchman deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete watchman" });
  }
};