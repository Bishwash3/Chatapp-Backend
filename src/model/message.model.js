import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
          },
          senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // optional for group messages
          },
          content: {
            type: String,
            required: true,
          },
          status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent',
          },
          isGroupMessage: {
            type: Boolean,
            default: false,
          },
    },
    {
        timestamps: true
    }
)

export const Message = mongoose.model("Message", messageSchema)