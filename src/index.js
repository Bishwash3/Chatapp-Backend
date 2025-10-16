import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { Message } from "./model/message.model.js";
import { Chat } from "./model/chat.model.js";

dotenv.config({
    path: './.env'
})

const server = http.createServer(app)
const io = new Server(server,{
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
})

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining
  socket.on("join", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (messageData) => {
    const { senderId, recipientId, groupId, content } = messageData;

    try {
      if (groupId) {
        // Handle group message
        const chat = await Chat.findOne({ _id: groupId, isGroupChat: true });
        if (!chat) {
          socket.emit("error", { message: "Group chat not found" });
          return;
        }

        const newMessage = await Message.create({
          chatId: groupId,
          senderId,
          content,
          isGroupMessage: true,
        });

        chat.lastMessage = newMessage._id;
        await chat.save();

        // Emit the message to all participants in the group
        socket.to(groupId).emit("receiveMessage", newMessage);
      } else if (recipientId) {
        // Handle one-on-one message
        let chat = await Chat.findOne({
          isGroupChat: false,
          participants: { $all: [senderId, recipientId], $size: 2 },
        });

        if (!chat) {
          chat = await Chat.create({
            participants: [senderId, recipientId],
            isGroupChat: false,
          });
        }

        const newMessage = await Message.create({
          chatId: chat._id,
          senderId,
          recipientId,
          content,
          isGroupMessage: false,
        });

        chat.lastMessage = newMessage._id;
        await chat.save();

        // Emit the message to the recipient
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receiveMessage", newMessage);
        }
      }
    } catch (error) {
      console.error("Error handling sendMessage:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});



connectDB()
.then( () => {
    server.listen(process.env.PORT || 7000, () => {
        console.log(`server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGODB Connection Failed!", err)
})