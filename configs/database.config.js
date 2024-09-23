const mongoose = require("mongoose");

module.exports = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      // console.log("connected to db!😄");
    })
    .catch((err) => {
      // console.log("Couldn't connect to database!☹️", err);
    });
};
