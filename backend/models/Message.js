const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },

    from: { type: Schema.Types.ObjectId, ref: "User", required: true },

    text: String,

    attachments: [
      {
        filename: String,
        url: String,
        mimeType: String,
        size: Number,
      },
    ],

    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],

    isDeletedForEveryone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ chat: 1, createdAt: -1 });

module.exports = model("Message", MessageSchema);
