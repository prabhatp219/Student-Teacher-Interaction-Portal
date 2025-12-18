const { Schema, model } = require("mongoose");

const userRoles = ["student", "faculty", "admin"];

const AnnouncementSchema = new Schema(
  {
    title: { type: String, required: true },
    body: String,

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    audience: {
      type: String,
      enum: ["all", "department", "course", "role"],
      default: "all",
    },

    course: { type: Schema.Types.ObjectId, ref: "Course" },
    department: String,
    role: { type: String, enum: userRoles },

    pinned: { type: Boolean, default: false },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true }
);

module.exports = model("Announcement", AnnouncementSchema);
