const { Schema, model } = require("mongoose");

const userRoles = ["student", "faculty", "admin"];

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: userRoles, default: "student" },

    avatarUrl: String,
    department: String,

    meta: {
      rollNo: String,
      semester: Number,
      extra: Schema.Types.Mixed,
    },

    isActive: { type: Boolean, default: true },
    lastSeenAt: Date,
  },
  { timestamps: true }
);

// UserSchema.index({ email: 1 });

module.exports = model("User", UserSchema);
