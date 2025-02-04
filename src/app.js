import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//Router Import
import userRouter from "./router/user.router.js"
import addFriendRouter from "./router/friend.router.js"

//Router deceleration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/users", addFriendRouter)


export {app}