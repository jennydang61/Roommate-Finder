import express from "express";

const router = express.Router();

// send message requests
router.post("/send", async (req, res) => {
    const { receiver_ID, sender_ID, sender_name, description } = req.body;

    try {
        const statusQuery = `
        INSERT INTO Status (status_context, status_name, description, created_date, last_updated)
        VALUES ('Roommate Request', 'Pending', ?, CURRENT_DATE, CURRENT_DATE);
        `;
        
        req.db.query(statusQuery, [description], (err, statusResult) => {
            if (err) {
                return res.status(500).json({ error: "Error inserting into Status", details: err.message });
            }
            
            const status_ID = statusResult.insertId;

            const requestQuery = `
            INSERT INTO RoommateRequest (receiver_ID, sender_ID, status_ID, sender_name)
            VALUES (?, ?, ?, ?);
        `;
        

            req.db.query(requestQuery, [receiver_ID, sender_ID, status_ID, sender_name], (err, requestResult) => {
                if (err) {
                    return res.status(500).json({ error: "Error inserting into RoommateRequest", details: err.message });
                }

                return res.json({
                    message: "Test request inserted successfully",
                    status_ID,
                });
            });
        });
    } catch (err) {
        console.error("Unexpected server error:", err);
        return res.status(500).json({ error: "Unexpected server error", details: err.message });
    }
});

router.post("/accept", async (req, res) => {
    const { receiver_ID, accepted_by } = req.body;

    try {
        const statusQuery = `
        SELECT status_ID, sender_name FROM RoommateRequest WHERE receiver_ID = ?;
        `;
        
        req.db.query(statusQuery, [receiver_ID], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Error fetching status_ID", details: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: "No request found for the given receiver_ID" });
            }

            const status_ID = result[0].status_ID;

            const updateStatusQuery = `
            UPDATE Status 
            SET status_name = 'Accepted', last_updated = CURRENT_DATE
            WHERE status_ID = ?;
            `;

            req.db.query(updateStatusQuery, [status_ID], (err) => {
                if (err) {
                    return res.status(500).json({ error: "Error updating status", details: err.message });
                }

                const insertAcceptedQuery = `
                INSERT INTO Accepted (status_ID, accepted_by)
                VALUES (?, ?);
                `;

                req.db.query(insertAcceptedQuery, [status_ID, accepted_by], (err) => {
                    if (err) {
                        return res.status(500).json({ error: "Error inserting into Accepted table", details: err.message });
                    }

                    return res.status(201).json({
                        message: "Request accepted successfully",
                        status_ID,
                    });
                });
            });
        });
    } catch (err) {
        return res.status(500).json({ error: "Unexpected server error", details: err.message });
    }
});

router.post("/decline", async (req, res) => {
    const { receiver_ID, declined_by } = req.body;

    try {
        const statusQuery = `
        SELECT status_ID, sender_name FROM RoommateRequest WHERE receiver_ID = ?;
        `;
        
        req.db.query(statusQuery, [receiver_ID], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Error fetching status_ID", details: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: "No request found for the given receiver_ID" });
            }

            const status_ID = result[0].status_ID;

            const updateStatusQuery = `
            UPDATE Status 
            SET status_name = 'Declined', last_updated = CURRENT_DATE
            WHERE status_ID = ?;
            `;

            req.db.query(updateStatusQuery, [status_ID], (err) => {
                if (err) {
                    return res.status(500).json({ error: "Error updating status", details: err.message });
                }

                const insertDeclinedQuery = `
                INSERT INTO Declined (status_ID, declined_by)
                VALUES (?, ?);
                `;

                req.db.query(insertDeclinedQuery, [status_ID, declined_by], (err) => {
                    if (err) {
                        return res.status(500).json({ error: "Error inserting into Declined table", details: err.message });
                    }

                    return res.status(201).json({
                        message: "Request declined successfully",
                        status_ID,
                    });
                });
            });
        });
    } catch (err) {
        return res.status(500).json({ error: "Unexpected server error", details: err.message });
    }
});

router.get("/status", async (req, res) => {
    const { receiver_ID, sender_ID } = req.query; 

    try {
        const statusQuery = `
        SELECT S.status_name, RR.sender_name
        FROM RoommateRequest AS RR
        NATURAL JOIN Status AS S
        WHERE RR.receiver_ID = ? OR RR.sender_ID = ?;
        `;

        req.db.query(statusQuery, [receiver_ID, sender_ID], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Error fetching status", details: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "No status found for the given users" });
            }

            res.json(results); 
        });
    } catch (err) {
        res.status(500).json({ error: "Unexpected server error", details: err.message });
    }
});

export default router;
