const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },
    course: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
      validate: {
        validator: Number.isInteger,
        message: "Age must be a whole number",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);