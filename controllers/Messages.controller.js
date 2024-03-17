const MessagesModel = require("../models/Messages.model");
const UsersModel = require("../models/Users.model");
const CustomError = require("../utils/CustomError");
const asyncWrapper = require("../utils/asyncWrapper");
const { AddMessageSchema } = require("../libs/validation/message.validation");

class MessagesController {
  getMessages = asyncWrapper(async (req, res, next) => {
    const receiverUsername = req.query.receiverUsername;
    const userId = req.user?._id;

    const reciever = await UsersModel.findOne({ username: receiverUsername });

    if (reciever == null) throw new CustomError(404, "User not found!");

    const messages = await MessagesModel.find(
      {
        $or: [
          { sender: userId, receiver: reciever?._id },
          { sender: reciever?._id, receiver: userId },
        ],
      },
      { id: "$_id", sender: true, receiver: true, content: true, _id: 0 }
    );

    return res.status(200).json({
      success: true,
      message: "Found messages!",
      messages,
    });
  });

  addMessage = asyncWrapper(async (req, res, next) => {
    const { receiverUsername, content } = req.body;
    const userId = req.user?._id;

    const isValid = AddMessageSchema.safeParse({
      message: content,
    });

    if (!isValid.success) {
      throw new CustomError(400, "Errors in received data!", isValid.error);
    }

    const receiver = await UsersModel.findOne({ username: receiverUsername });

    if (receiver == null) throw new CustomError(404, "User not found!");

    const message = await MessagesModel.create({
      content: isValid?.data?.message,
      sender: userId,
      receiver: receiver?._id,
    });

    if (message?._id == null)
      throw new CustomError(400, "Something went wrong!");

    return res.status(201).json({
      success: true,
      message: "Message added successfully!",
    });
  });
}

module.exports = new MessagesController();
