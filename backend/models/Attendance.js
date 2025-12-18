const { Schema, model } = require("mongoose");

const AttendanceSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    date: { type: Date, required: true },

    present: [{ type: Schema.Types.ObjectId, ref: "User" }],
    takenBy: { type: Schema.Types.ObjectId, ref: "User" },

    note: String,
  },
  { timestamps: true }
);

AttendanceSchema.index({ course: 1, date: 1 }, { unique: true });

module.exports = model("Attendance", AttendanceSchema);
