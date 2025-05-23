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
import friendRouter from "./router/friend.router.js"
import groupRouter from "./router/group.router.js"
import chatRouter from "./router/chat.router.js"
import messageRouter from "./router/message.router.js"


//Router deceleration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/friends", friendRouter)
app.use("/api/v1/group", groupRouter)
app.use("/api/v1/chat", chatRouter)
app.use("/api/v1/message", messageRouter)



export {app}