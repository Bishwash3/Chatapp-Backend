import mongoose from "mongoose"

const chatSchema = new mongoose.Schema(
    {
     participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
     }],
     isGroupChat: {
        type: Boolean,
        default: false
     },
     groupName: {
        type: String,
        required: function() { return this.isGroupChat;}
     },
     lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
     },
     deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    },
    {
        timestamps: true
    }
)

export const Chat = mongoose.model("Chat", chatSchema)