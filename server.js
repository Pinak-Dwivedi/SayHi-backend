if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

// cors
const cors = require("cors");

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
  })
);

// cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// mongoose
require("./configs/database.config")();

// passport
require("./configs/passport.config");

// cloudinary
require("./configs/cloudinary.config");

// routers
const usersRouter = require("./routes/users.route");
app.use("/api/users", usersRouter);

const messagesRouter = require("./routes/messages.route");
app.use("/api/messages", messagesRouter);

// global error middleware
const errorHandler = require("./middlewares/errorHandler.middleware");
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const appServer = app.listen(PORT, () => {
  // console.log("Server is listening on port " + PORT)
});

module.exports = appServer;

// socket
require("./socketServer");
