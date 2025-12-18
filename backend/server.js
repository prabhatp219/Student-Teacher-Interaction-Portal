const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});


// Serve uploaded files (optional but needed for submissions/messages)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Error:", err));

// Import routes folder
const apiRoutes = require("./routes");

// Mount all API routes under /api/v1
app.use("/api/v1", apiRoutes);

// Default test route
app.get("/", (req, res) => res.send("API is running 🔥"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
