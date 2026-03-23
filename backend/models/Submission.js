const { Schema, model } = require("mongoose");

const SubmissionSchema = new Schema(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },

    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔥 optional text answer (important addition)
    content: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    // 🔥 file uploads
    files: [
      {
        filename: { type: String },
        url: { type: String },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // 🔥 grading section
    grade: {
      type: Number,
      min: 0,
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    gradedAt: {
      type: Date,
    },

    // 🔥 submission status (very useful)
    status: {
      type: String,
      enum: ["submitted", "graded", "late"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

// 🔥 prevent duplicate submissions
SubmissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
);

module.exports = model("Submission", SubmissionSchema);