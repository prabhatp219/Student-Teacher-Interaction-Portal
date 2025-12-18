const { Schema, model } = require("mongoose");

const AssignmentSchema = new Schema(
  {
    // Relationship
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    },
    courseName: {
      type: String,
      required: true
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Core info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      trim: true
    },

    // Timing
    dueAt: {
      type: Date,
      required: true
    },

    allowLate: {
      type: Boolean,
      default: false
    },

    latePenaltyPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    // Marks
    maxMarks: {
      type: Number,
      required: true,
      min: 1
    },

    // Attachments
    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        mimeType: { type: String },
        size: { type: Number }
      }
    ],

    // State
    status: {
      type: String,
      enum: ["draft", "published", "archived","not published"],
      default: "not published"
    }
  },
  { timestamps: true }
);

// Indexes for fast queries
AssignmentSchema.index({ course: 1, dueAt: 1 });
AssignmentSchema.index({ createdBy: 1 });

module.exports = model("Assignment", AssignmentSchema);
