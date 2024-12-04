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

      // Insert user into the database
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

          const user_id = result.insertId;

          // Insert the user's initial 'Pending' status
          const insertStatusQuery = `
            INSERT INTO Status (status_context, status_name, description, user_id, created_date, last_updated)
            VALUES ('Verification', 'Pending', 'Waiting for verification', ?, NOW(), NOW())
          `;
          req.db.query(insertStatusQuery, [user_id], (err) => {
            if (err) {
              console.error("Error inserting status:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            res.status(201).json({
              message: "User has been created and is waiting for verification.",
              user_id,
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


// Login a user
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const query = "SELECT * FROM User WHERE email = ?";
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

    res.status(200).json({ message: "Login successful!", user });
  });
});

// Fetch all pending users
router.get("/admin/pendingUsers", (req, res) => {
  console.log("GET /admin/pendingUsers called");
  const query = `
    SELECT u.user_ID, u.name, u.email, s.status_name, s.description 
    FROM User u
    JOIN Status s ON u.user_ID = s.user_id
    WHERE s.status_context = 'Verification' AND s.status_name = 'Pending'
  `;

  req.db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching pending users:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    console.log("Results:", results);
    res.status(200).json(results);
  });
});

// Approve or decline a user
router.post("/admin/updateUserStatus", (req, res) => {
  const { user_id, status_name, admin_id } = req.body;

  if (!user_id || !status_name || !admin_id) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (!["Accepted", "Declined"].includes(status_name)) {
    return res.status(400).json({ message: "Invalid status name!" });
  }

  const description =
    status_name === "Accepted"
      ? "Account verified by admin"
      : "Account declined by admin";

  // Update the user's status in the Status table
  const updateStatusQuery = `
    UPDATE Status
    SET status_name = ?, description = ?, last_updated = NOW()
    WHERE user_id = ? AND status_context = 'Verification'
  `;

  req.db.query(updateStatusQuery, [status_name, description, user_id], (err) => {
    if (err) {
      console.error("Error updating user status:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Move the user to the appropriate table (Accepted or Declined)
    const targetTable = status_name === "Accepted" ? "Accepted" : "Declined";
    const column = status_name === "Accepted" ? "accepted_by" : "declined_by";

    const insertQuery = `
      INSERT INTO ${targetTable} (status_ID, ${column})
      SELECT status_ID, ? FROM Status
      WHERE user_id = ? AND status_context = 'Verification'
    `;

    req.db.query(insertQuery, [admin_id, user_id], (err) => {
      if (err) {
        console.error(`Error moving user to ${targetTable} table:`, err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.status(200).json({ message: `User status updated to ${status_name} and moved to ${targetTable} table.` });
    });
  });
});




// Verify account 
router.post("/verifyAccount", (req, res) => {
  const { user_id, status_name, admin_id } = req.body;

  if (!user_id || !status_name || !admin_id) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (!["Accepted", "Declined"].includes(status_name)) {
    return res.status(400).json({ message: "Invalid status name!" });
  }

  const description =
    status_name === "Accepted"
      ? "Account verified by admin"
      : "Account declined by admin";

  // First, fetch the status_ID for the given user_id
  const fetchStatusIdQuery = `
    SELECT status_ID 
    FROM Status 
    WHERE user_id = ? AND status_context = 'Verification'
  `;

  req.db.query(fetchStatusIdQuery, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching status_ID:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Status not found for the given user." });
    }

    const status_ID = results[0].status_ID;

    // Update status_ID
    const updateStatusQuery = `
      UPDATE Status 
      SET status_name = ?, description = ?, last_updated = NOW()
      WHERE status_ID = ?
    `;

    req.db.query(updateStatusQuery, [status_name, description, status_ID], (err) => {
      if (err) {
        console.error("Error updating status:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.status(200).json({ message: `${status_name}.` });
    });
  });
});

// For Verified Accounts
router.post("/restrictedLogin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const query = `
    SELECT u.*, s.status_name 
    FROM User u
    JOIN Status s ON u.user_ID = s.user_ID
    WHERE u.email = ? AND s.status_context = 'Verification'
  `;

  req.db.query(query, [email], async (err, result) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid credentials or account not found!" });
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
