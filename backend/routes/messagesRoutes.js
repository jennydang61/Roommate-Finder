import express from "express";

const router = express.Router();

// this is suppose to get the chat list of who the user is talking to. im not sure if its working
router.get("/chatUsers", (req, res) => {
    const { user_ID } = req.query;

    const query = `
    SELECT DISTINCT 
        CASE 
            WHEN sender_ID = ? THEN receiver_ID
            ELSE sender_ID
        END AS user_ID,
        U.email
    FROM Message
    JOIN User AS U ON U.user_ID = 
        CASE 
            WHEN sender_ID = ? THEN receiver_ID
            ELSE sender_ID
        END
    WHERE sender_ID = ? OR receiver_ID = ?;
`;

    req.db.query(query, [user_ID, user_ID, user_ID, user_ID], (err, results) => {
        if (err) {
            console.error("Error fetching chat users:", err);
            return res.status(500).json({ error: "Error fetching chat users" });
        }

        res.json(results);
    });
});


// send message 
router.post("/sendMessage", (req, res) => {
    const { sender_ID, receiver_ID, content } = req.body;

    const query = `
        INSERT INTO Message (sender_ID, receiver_ID, content, time_stamp)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP);
    `;

    req.db.query(query, [sender_ID, receiver_ID, content], (err, result) => {
        if (err) {
            console.error("Error sending message:", err);
            return res.status(500).json({ error: "Error sending message" });
        }

        res.status(201).json({
            message_ID: result.insertId,
            message: "Message sent successfully",
        });
    });
});


// get chat between two users
router.get("/chat", (req, res) => {
    const { user1_ID, user2_ID } = req.query;

    const query = `
        SELECT M.message_ID, M.sender_ID, M.receiver_ID, M.content, M.time_stamp
        FROM Message AS M
        WHERE (M.receiver_ID = ? AND M.sender_ID = ?)
        OR (M.receiver_ID = ? AND M.sender_ID = ?)
        ORDER BY M.time_stamp DESC;
    `;

    req.db.query(query, [user1_ID, user2_ID, user2_ID, user1_ID], (err, results) => {
        if (err) {
            console.error("Error fetching chat:", err);
            return res.status(500).json({ error: "Error fetching chat" });
        }

        res.json(results);
    });
});


export default router