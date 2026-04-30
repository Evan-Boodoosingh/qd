const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Queued API is running" });
});

// Routes
app.use("/api/users", require("./routes/users"));
app.use('/api/anime', require('./routes/anime'))

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/queued")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = app;
