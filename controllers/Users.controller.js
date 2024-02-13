const passport = require("passport");
const UsersModel = require("../models/Users.model");
const bcrypt = require("bcrypt");
const createJwtToken = require("../utils/createJwtToken");
const createCookieOptions = require("../utils/createCookieOptions");
const { RegisterSchema } = require("../libs/validation/user.validation");
const asyncWrapper = require("../utils/asyncWrapper");
const CustomError = require("../utils/CustomError");

class UsersController {
  // register

  register = asyncWrapper(async (req, res, next) => {
    const isValid = RegisterSchema.safeParse(req.body);

    if (!isValid.success) {
      throw new CustomError(400, "Errors in received data!", isValid.error);
    }

    passportLocalAuthenticate(req, res, next, async (error, user, info) => {
      if (!user && info?.message === "User not found!") {
        // register user

        const { data } = isValid;

        const newUser = await UsersModel.create({
          username: data.username,
          email: data.email,
          password: bcrypt.hashSync(data.password, 10),
        });

        const token = createJwtToken({
          userId: newUser._id,
        });
        const cookieOptions = createCookieOptions();

        return res.status(201).cookie("token", token, cookieOptions).json({
          success: true,
          user: newUser.userInfo,
          message: "Registered successfully!",
        });
      }

      if (!user && info?.message === "Incorrect password!")
        throw new CustomError(401, "Username already in use!");

      if (error || info instanceof Error)
        throw new CustomError(501, "Something went wrong!");

      throw new CustomError();
    });
  });

  // login

  login = asyncWrapper(async (req, res, next) => {
    passportLocalAuthenticate(req, res, next, (error, user, info) => {
      if (!user && info?.message === "User not found!") {
        throw new CustomError(401, "Incorrect username or passowrd!");
      }

      const token = createJwtToken({
        userId: user._id,
      });
      const cookieOptions = createCookieOptions();

      return res.status(200).cookie("token", token, cookieOptions).json({
        success: true,
        user: newUser.userInfo,
        message: "Logged in successfully!",
      });
    });
  });
}

function passportLocalAuthenticate(req, res, next, cb) {
  passport.authenticate("local", { session: false }, cb)(req, res, next);
}

module.exports = new UsersController();
