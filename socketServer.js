const appServer = require("./server");
const passport = require("passport");
const { Server } = require("socket.io");
const UsersModel = require("./models/Users.model");
const MessagesModel = require("./models/Messages.model");
const { AddMessageSchema } = require("./libs/validation/message.validation");
const {
  CONNECTION,
  DISCONNECT,
  ADD_USER,
  SEND_MESSAGE,
  RECEIVE_MESSAGE,
  WELCOME,
  TYPING_START,
  TYPING_STOP,
  CONNECT_ERROR,
} = require("./utils/socketEvents");

// const io = new Server(appServer, {
//   cors: {
//     origin: [process.env.FRONTEND_URL],
//   },
// });

const io = new Server(appServer);

// authentication middleware
io.engine.use((req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    if (user) {
      return next();
    }
    return next(new Error("Not Authenticated!"));
  })(req, res, next);
});

// users connected with socket

let users = [];

// events

io.on(CONNECTION, (socket) => {
  // console.log("A user connected! ", socket.id);

  //   welcome
  io.to(socket.id).emit(WELCOME, "Welcome to SayHi's socket server");

  // add user
  socket.on(ADD_USER, (userData, cb) => {
    // check if this user does not already exist
    // console.log("add user");
    // console.log(userData);

    if (users.some((user) => user?.username === userData?.username)) {
      users = users.filter((user) => user?.username !== userData?.username);

      users.push({
        userId: userData?.id,
        username: userData?.username,
        socketId: socket.id,
      });
    } else {
      users.push({
        userId: userData?.id,
        username: userData?.username,
        socketId: socket.id,
      });
    }
    // console.log(socket.id);
    // console.log(users);

    if (typeof cb === "function") cb();
  });

  // typing start
  socket.on(TYPING_START, (data) => {
    // console.log("typing start");

    onTypingStart(socket, data);
  });

  // typing stop
  socket.on(TYPING_STOP, (data) => {
    // console.log("typing stop");

    onTypingStop(socket, data);
  });

  //   send message
  socket.on(SEND_MESSAGE, async (messageData, cb) => {
    // console.log("send message");

    // console.log(messageData);

    await onSendMessage(io, socket, messageData);

    if (typeof cb === "function") cb();
  });

  // connect error
  socket.on(CONNECT_ERROR, (message) => {
    // console.log("connect error ", message);
  });

  socket.on(DISCONNECT, () => {
    users = users.filter((user) => user.socketId !== socket.id);

    // console.log("User disconnected!");
  });
});

function onTypingStart(socket, data) {
  const { receiverUsername } = data;

  // check if reciver is live
  const receiverSocket = users.find(
    (user) => user?.username === receiverUsername
  );

  // console.log(users, receiverSocket);

  if (receiverSocket == null) return;

  socket.to(receiverSocket.socketId).emit(TYPING_START);
}

function onTypingStop(socket, data) {
  const { receiverUsername } = data;

  // check if reciver is live
  const receiverSocket = users.find(
    (user) => user?.username === receiverUsername
  );

  if (receiverSocket == null) return;

  socket.to(receiverSocket.socketId).emit(TYPING_STOP);
}

async function onSendMessage(io, socket, messageData) {
  const { senderUsername, receiverUsername, content } = messageData;

  const isValid = AddMessageSchema.safeParse({
    message: content,
  });

  if (!isValid.success) return;

  const senderAndReceiver = await UsersModel.find({
    $or: [{ username: senderUsername }, { username: receiverUsername }],
  });

  if (
    senderAndReceiver == null ||
    !senderAndReceiver?.length ||
    senderAndReceiver?.length < 2
  )
    return;

  const sender = senderAndReceiver.find(
    (user) => user?.username === senderUsername
  );
  const receiver = senderAndReceiver.find(
    (user) => user?.username === receiverUsername
  );

  const message = await MessagesModel.create({
    content: isValid?.data?.message,
    sender: sender?._id,
    receiver: receiver?._id,
  });

  // console.log("message", message);

  if (message == null) return;

  // check if reciver is live
  const receiverSocket = users.find(
    (user) => user?.userId === receiver._id.valueOf()
  );

  const receiveMessageData = {
    id: message?._id?.valueOf(),
    content: message?.content,
    sender: message?.sender?.valueOf(),
    reciever: message?.receiver?.valueOf(),
  };

  if (receiverSocket == null) {
    // only to sender
    // console.log("recieve message");
    io.to(socket.id).emit(RECEIVE_MESSAGE, receiveMessageData);
    return;
  }

  // console.log("recieve message");
  io.to([socket.id, receiverSocket.socketId]).emit(
    RECEIVE_MESSAGE,
    receiveMessageData
  );
}
