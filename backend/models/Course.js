const { Schema, model } = require("mongoose");

const CourseSchema = new Schema(
  {
    code: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: String,

    department: String,
    semester: Number,

    faculty: [{ type: Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],

    tags: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourseSchema.index({ code: 1, title: 1 });

module.exports = model("Course", CourseSchema);
