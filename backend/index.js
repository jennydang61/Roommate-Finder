import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import requestsRoutes from "./routes/requestsRoutes.js";
import messagesRoutes from "./routes/messagesRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";


dotenv.config();
console.log("Database Host:", process.env.MYSQL_ADDON_HOST);

const app = express();
app.use(cors());
app.use(express.json());


/*const db = mysql.createConnection({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: process.env.MYSQL_ADDON_PORT,
})**/

const db = mysql.createConnection({
  host: "bsghd1ohgovjblcstago-mysql.services.clever-cloud.com",
  user: "uu421pflxkdpnfje",
  password: "KbFysvS34GyqdHLCOX6x",
  database: "bsghd1ohgovjblcstago",
  port: 3306,
});


db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the MySQL database!");
});

app.get("/", (req, res) => {
  res.json("hello this is the backend");
});

/*app.get("/users", (req, res) => {
  const q = "SELECT * FROM User";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});*/

app.use((req, res, next) => {
  req.db = db; 
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/createProfile", profileRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/messages", messagesRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("sendMessage", (message) => {
      console.log("Message received on server:", message);
  });

  socket.on("sendRequest", (request) => {
      console.log("Request received on server:", request);
  });

  socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
  });
});

// Replace app.listen() with httpServer.listen()
httpServer.listen(8800, () => {
  console.log("Connected to backend");
});
