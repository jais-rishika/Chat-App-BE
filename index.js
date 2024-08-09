const express = require("express");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 8000;

//creating socket.io server
const { Server } = require("socket.io");
const { createServer } = require("http");
const path= require("path")
const server = createServer(app); //express instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const routes = require("./Routers/index.js");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

const dbConnect = require("./Config/config.js");

const User = require("./Model/user.js");
const FriendRequest = require("./Model/friends.js");
//personal chat


//if error or exception comes athat we can't catch can off the server
process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  })
);

dbConnect();

app.use(helmet());
//to parse form data
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 100000000,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use("/api/v1", routes);
const limiter = rateLimit({
  max: 4000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use("/chatup", limiter);

if (process.env.NODE_ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
}

//server Setup
server.listen(8080, () => {
  console.log(`socket Server is running at PORT ${8080}`);
});

//the moment this connection is established the user is provided the unique socket id
io.on("connection", async (socket) => {
  const user_id = socket.handshake.query["user_id"];
  const socket_id = socket.id;
  if (user_id) {
    await User.findByIdAndUpdate(user_id, { socket_id });
  }

  //create friend Request
  socket.on("friend_request", async (data) => {
    console.log(data);
    const to = await User.findById(data.to);
    const from = await User.findById(data.from);

    await FriendRequest.create({
      sender: data.from,
      recipient: data.to,
    });

    //send the friend Request
    //io.to emit the event to a specific socket_id
    io.to(to.socket_id).emit("new_friend_request", {
      message: "new Friend Request Received",
    });
    io.to(from.socket_id).emit("request_sent", {
      message: "request sent",
    });
  });

  //accepting Friend Request
  socket.on("accept_request", async (data) => {
    const request_doc = await FriendRequest.findById(data.request_id);
    const sender = await User.findById(request_doc.sender);
    const recipient = await User.findById(request_doc.recipient);

    sender.friends.push(request_doc.recipient);
    recipient.friends.push(request_doc.sender);

    await sender.save({ new: true, validateModifiedOnly: true });
    await recipient.save({ new: true, validateModifiedOnly: true });

    await FriendRequest.findByIdAndDelete(data.request_id);

    io.to(sender.socket_id).emit("request_accepted", () => {
      message: "Request is accepted successfully";
    });
    io.to(recipient.socket_id).emit("request_accepted", () => {
      message: "Request is accepted successfully";
    });
  });

  //closing socket Connection
  socket.on("end", () => {
    console.log("Closing the connection...");
    socket.disconnect(0);
  });
});

//promise rejection is handled if not handled saperately
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
