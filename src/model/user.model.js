import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        profilePicture: {
            type: String,
        },
        isLoggedIn: {
            type: Boolean,
            default: false
        },
        socketId: {
            type: String, // to track active connections
            default: null,
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        deviceTokens: {
            type: [String], // for push notifications
            default: [],
        },
        status: {
            type: String,
            enum: ['online', 'offline', 'away'],
            default: 'offline',
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("user", userSchema)