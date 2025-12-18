const { Schema, model } = require("mongoose");

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: { type: String, required: true },

    payload: Schema.Types.Mixed,

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1 });

module.exports = model("Notification", NotificationSchema);
