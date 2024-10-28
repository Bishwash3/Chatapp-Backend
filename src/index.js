import http from "http"
import {Server} from "socket.io"
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})

const server = http.createServer(app)
const io = new Server(server,{
    cors: {origin: process.env.CORS_ORIGIN}
})




connectDB()
.then( () => {
    server.listen(process.env.PORT || 7000, () => {
        console.log(`server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGODB Connection Failed!", err)
})