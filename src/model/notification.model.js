import mongoose, { Schema } from "mongoose"

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["friend_request", "message", "group_message", "info"],
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "chat",
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "message",
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export const Notification = mongoose.model("notification", notificationSchema)
