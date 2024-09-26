const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const chat = require('./model/chat');
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/maiChat")
  .then(() => console.log("mongo connected"))
  .catch((err) => console.log(err))

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
  },
});


let users = [];

const addUser = (userId, socketId) => {
  users = users.filter((user) => user.userId !== userId)
  users.push({ userId, socketId });
}

const getUser = (receiverId, onlineUser) => {
  return onlineUser.filter((user) => user.userId === receiverId);
};

io.on("connection", (socket) => {

  socket.on("users", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", async ({ connectionId, senderId, senderName, receiverId, message, createdAt }) => {
    const user = getUser(receiverId, users);
    if (user.length !== 0) {
      io.to(user[0].socketId).emit("getMessage", {
        senderId,
        senderName,
        receiverId,
        message,
        createdAt,
      });
    }
    await chat.create({ connectionId: connectionId, sender: senderId, message: message })
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
