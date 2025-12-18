const { Schema, model } = require("mongoose");

const SubmissionSchema = new Schema(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    files: [
      {
        filename: String,
        url: String,
        mimeType: String,
        size: Number,
      },
    ],

    submittedAt: { type: Date, default: Date.now },

    grade: Number,
    feedback: String,
    gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = model("Submission", SubmissionSchema);
