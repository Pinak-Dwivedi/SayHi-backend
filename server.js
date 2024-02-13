if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

// cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// mongoose
require("./configs/database.config")();

// passport
require("./configs/passport.config");

// routers
const usersRouter = require("./routes/users.route");
app.use("/api/users", usersRouter);

// global error middleware
const errorHandler = require("./middlewares/errorHandler.middleware");
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server is listening on port " + PORT));
