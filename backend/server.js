require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const Student = require("./models/Student");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Student Management API is running" });
});

app.get("/students", async (_req, res, next) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (error) {
    next(error);
  }
});

app.post("/students", async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
});

app.put("/students/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
});

app.delete("/students/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted" });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (error.code === 11000) {
    return res.status(409).json({ message: "A student with this email already exists" });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: "An unexpected server error occurred" });
});

async function startServer() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/collegeDB",
    );
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;