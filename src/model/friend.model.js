import mongoose, { Schema } from "mongoose"

const friendsSchema = new Schema({
        user1: {
            type: Schema.Types.ObjectId,
            ref: "User"
            },
        user2: {
            type: Schema.Types.ObjectId,
            ref: "User"
            }
        },
        {
            timestamps: true
        }
    )

export const Friends = mongoose.model("Friends", friendsSchema)