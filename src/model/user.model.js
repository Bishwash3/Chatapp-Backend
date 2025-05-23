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

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()    
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
     return jwt.sign(
         {
             _id: this._id,
             email: this.email,
             username: this.username,
             fullName: this.fullName
         },
         process.env.ACCESS_TOKEN_SECRET,
         {
             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
         }
     )
}

userSchema.methods.generateRefreshToken = function (){
     return jwt.sign(
         {
             _id: this._id
         },
         process.env.REFRESH_TOKEN_SECRET,
         {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
         }
     )
}

export const User = mongoose.model("user", userSchema)