const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const productRoutes = require("./routes/product.routes");
require("dotenv").config({ path: "./config/.env" });
const cors = require("cors");
const { connectDB, closeDB } = require("./config/connection");
const app = express();

app.use(cors());
app.use(express.json());
// app.use("/product", productRoutes);

//Healthcheck
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/product", productRoutes);

// Middleware d'erreurs (format JSON)
app.use((req, res, err) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: { message: err.message || "Internal Server Error" } });
});

// Implémentation de socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("[WebSocket] : connected", socket.id);
  socket.on("disconnect", () =>
    console.log("[WebSocket] : disconnected", socket.id)
  );
});

// Démarre le server express
connectDB()
  .then(() =>
    httpServer.listen(process.env.PORT, () => {
      console.log("[API] : Listening on port " + process.env.PORT);
    })
  )
  .catch((err) => {
    console.error("Le server a crash : ", err);
    process.exit(1);
  });

// Arrêt propre des connexions à la base de données (Ctrl+C / SIGTERM)
["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, async () => {
    await closeDB();
    process.exit(0);
  });
});
module.exports = app;
