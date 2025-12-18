const { Schema, model } = require("mongoose");

const LogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },

    action: { type: String, required: true },

    meta: Schema.Types.Mixed,

    ip: String,
  },
  { timestamps: true }
);

module.exports = model("Log", LogSchema);
