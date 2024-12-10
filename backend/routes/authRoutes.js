import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// register a user
router.post("/register", async (req, res) => {
  const { name, email, password, user_type } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // check if email already exists
    const checkQuery = "SELECT * FROM User WHERE email = ?";
    req.db.query(checkQuery, [email], async (err, result) => {
      if (err) {
        console.error("Error checking email:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Email already exists!" });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // insert user into the database
      const insertQuery =
        "INSERT INTO User (name, email, password, user_type) VALUES (?, ?, ?, ?)";
      req.db.query(
        insertQuery,
        [name, email, hashedPassword, user_type || "STUDENT"],
        (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          res.status(201).json({ message: "User has been created.", user_id: result.insertId});
        }
      );
    });
  } catch (error) {
    console.error("Error handling registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// login a user
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

//hello
//howdy

export default router;
