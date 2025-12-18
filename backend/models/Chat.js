const { Schema, model } = require("mongoose");

const ChatSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],

    type: { type: String, enum: ["one-to-one", "group"], default: "one-to-one" },

    title: String,
    lastMessageAt: Date,
  },
  { timestamps: true }
);

module.exports = model("Chat", ChatSchema);
