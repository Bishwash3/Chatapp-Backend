import mongoose from "mongoose"

const groupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true
        },
        groupPicture: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    {
        timestamps: true
    }
)

export const Group = ("Group", groupSchema)