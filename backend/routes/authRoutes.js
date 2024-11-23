import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// Register a user
router.post("/register", async (req, res) => {
  const { name, email, password, user_type } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Check if email already exists
    const checkQuery = "SELECT * FROM User WHERE email = ?";
    req.db.query(checkQuery, [email], async (err, result) => {
      if (err) {
        console.error("Error checking email:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Email already exists!" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // pending status
      const insertUserQuery =
        "INSERT INTO User (name, email, password, user_type) VALUES (?, ?, ?, ?)";
      req.db.query(
        insertUserQuery,
        [name, email, hashedPassword, user_type || "STUDENT"],
        (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          // Adds the initial pending status
          const userId = result.insertId;
          const insertStatusQuery =
            "INSERT INTO Status (status_context, status_name, user_ID) VALUES ('Verification', 'Pending', ?)";
          req.db.query(insertStatusQuery, [userId], (err) => {
            if (err) {
              console.error("Error setting status:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            res.status(201).json({
              message: "User registered and awaiting admin verification.",
              user_id: userId,
            });
          });
        }
      );
    });
  } catch (error) {
    console.error("Error handling registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin verification endpoint
router.post("/verify", (req, res) => {
  const { user_id, status_name, admin_id } = req.body;

  if (!user_id || !status_name || !admin_id) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (!["Accepted", "Declined"].includes(status_name)) {
    return res.status(400).json({ message: "Invalid status name!" });
  }

  const updateStatusQuery =
    "UPDATE Status SET status_name = ?, last_updated = NOW(), admin_id = ? WHERE user_ID = ?";
  req.db.query(updateStatusQuery, [status_name, admin_id, user_id], (err) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(200).json({ message: `User status updated to ${status_name}.` });
  });
});

// Login a user (only verified accounts)
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const query = `
    SELECT u.*, s.status_name 
    FROM User u
    JOIN Status s ON u.user_ID = s.user_ID
    WHERE u.email = ?`;
  req.db.query(query, [email], async (err, result) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    if (user.status_name !== "Accepted") {
      return res.status(403).json({ message: "Account not verified by admin." });
    }

    res.status(200).json({ message: "Login successful!", user });
  });
});

export default router;
