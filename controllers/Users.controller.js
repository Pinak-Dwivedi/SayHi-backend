const passport = require("passport");
const UsersModel = require("../models/Users.model");
const bcrypt = require("bcrypt");
const createJwtToken = require("../utils/createJwtToken");
const {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateSchema,
  VerifyOTPSchema,
} = require("../libs/validation/user.validation");
const asyncWrapper = require("../utils/asyncWrapper");
const CustomError = require("../utils/CustomError");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const generateForgotPassOTP = require("../libs/generateForgotPassOTP");
const sendEMail = require("../utils/sendEMail");

class UsersController {
  // auth

  auth = asyncWrapper(async (req, res, next) => {
    const token = req?.headers?.authorization?.split(" ")[1];

    return res.status(200).json({
      success: true,
      user: req.user?.userInfo,
      token,
      message: "Authenticated!",
    });
  });

  // register

  register = asyncWrapper(async (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;

    const isValid = RegisterSchema.safeParse({
      username,
      email,
      password,
      confirmPassword,
    });

    if (!isValid.success) {
      throw new CustomError(400, "Errors in received data!", isValid.error);
    }

    passportLocalAuthenticate(req, res, next, async (error, user, info) => {
      if (!user && info?.message === "User not found!") {
        // check if email is unique
        const { data } = isValid;

        const isUniqueEmail = await UsersModel.findOne({ email: data.email });

        if (isUniqueEmail != null)
          return next(new CustomError(401, "Email already in use!"));

        // register user
        const hashedPassword = await bcrypt.hash(data?.password, 10);

        const newUser = await UsersModel.create({
          username: data.username,
          email: data.email,
          password: hashedPassword,
        });

        const token = createJwtToken({
          userId: newUser._id,
        });

        return res.status(201).json({
          success: true,
          user: newUser.userInfo,
          token: token,
          message: "Registered successfully!",
        });
      }

      if (!user && info?.message === "Incorrect password!")
        return next(new CustomError(401, "Username already in use!"));

      if (error || info instanceof Error)
        return next(new CustomError(501, "Something went wrong!"));

      return next(new CustomError());
    });
  });

  // login

  login = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body;

    const isValid = LoginSchema.safeParse({
      username,
      password,
    });

    if (!isValid.success) {
      throw new CustomError(400, "Errors in received data!", isValid.error);
    }

    passportLocalAuthenticate(req, res, next, (error, user, info) => {
      if (!user)
        return next(new CustomError(401, "Incorrect username or passowrd!"));

      const token = createJwtToken({
        userId: user?._id,
      });

      return res.status(200).json({
        success: true,
        user: user?.userInfo,
        token: token,
        message: "Logged in successfully!",
      });
    });
  });

  // login with google

  loginWithGoogle = asyncWrapper(async (req, res, next) => {
    const { googleId, username, email, profilePicture } = req.body;

    const user = await UsersModel.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (user != null) {
      // cannot allow duplicate username or email
      if (user.googleId != googleId)
        return next(new CustomError(401, "Username or email already in use!"));

      // login user
      const token = createJwtToken({
        userId: user?._id,
      });

      return res.status(200).json({
        success: true,
        user: user?.userInfo,
        token: token,
        message: "Logged in successfully!",
      });
    }

    // register user

    const newUser = await UsersModel.create({
      googleId: googleId,
      username: username,
      email: email,
      profileImage: profilePicture,
      // password is optional in model
    });

    const token = createJwtToken({
      userId: newUser._id,
    });

    return res.status(201).json({
      success: true,
      user: newUser.userInfo,
      token: token,
      message: "Registered successfully!",
    });
  });

  // logout

  logout = asyncWrapper(async (req, res, next) => {
    // not really using this token in my react-native frontend app
    const token = createJwtToken(
      {
        logout: true,
      },
      true
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully!",
      token: token,
    });
  });

  // update

  update = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { username, email, profileImage } = req.body;

    const isValid = UpdateSchema.safeParse({
      username,
      email,
    });

    if (!isValid.success) {
      throw new CustomError(400, "Errors in received data!", isValid.error);
    }

    // check if it's the same user or admin or someone else

    if (id !== req.user?._id?.valueOf()) {
      if (req.user?.role !== "admin") {
        throw new CustomError(403, "Unauthorized access!");
      }
    }

    const user = await UsersModel.findById(id);

    if (user == null) throw new CustomError(401, "User not found!");

    // check if new username and email does not already exist in database

    const { data } = isValid;

    const isUnique = await UsersModel.findOne({
      _id: { $ne: user._id },
      $or: [{ username: data.username }, { email: data.email }],
    });

    if (isUnique != null)
      throw new CustomError(401, "Username or email already in use!");

    // profile image
    if (profileImage != null) {
      const imageUploadResult = await uploadImage(profileImage);

      if (imageUploadResult === "Image data is inappropriate")
        return next(CustomError(400, "Errors in received data"));

      if (imageUploadResult === "Wrong image format") {
        return res.status(400).json({
          success: false,
          message: "Errors in received data!",
          validationError: {
            profileImage: "Image format must be png|jpg|jpeg",
          },
        });
      }

      if (
        imageUploadResult === "Image upload failed" ||
        imageUploadResult?.public_id == null
      ) {
        throw new CustomError();
      }

      // check if user already has a profile image and that too associated with cloudinary not google
      if (user?.profileImage != null && user?.profileImagePublicId != null) {
        // delete image from cloudinary

        const deleteImageResult = await deleteImage(user?.profileImagePublicId);

        if (deleteImageResult === "Image delete failed")
          throw new CustomError();
      }

      user.profileImage = imageUploadResult.secure_url;
      user.profileImagePublicId = imageUploadResult.public_id;
    }

    // update user

    user.username = data.username;
    user.email = data.email;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Updated successfully!",
      user: user.userInfo,
    });
  });

  // forgot password

  forgotPassword = asyncWrapper(async (req, res, next) => {
    const { email } = req.body;

    const isValid = ForgotPasswordSchema.safeParse({ email });

    if (!isValid.success) {
      throw new CustomError(400, "Errors in received data!", isValid.error);
    }

    const user = await UsersModel.findOne({ email: email });

    if (user == null)
      return res.status(200).json({
        success: true,
        message: "Email sent successfully!",
      });

    // check their previous reset password request status

    // there should be a delay of 1 hour before assigning a new reset password OTP

    if (
      user.resetPasswordOTP != null &&
      Date.now() - user.resetPasswordOTPExpiry <= 45 * 60 * 1000
    ) {
      throw new CustomError(
        404,
        "Too many reset password request, please try after some time!"
      );
    }

    const OTP = generateForgotPassOTP();

    const to = user.email;
    const subject = "SayHi - Reset Password";
    const text = `${OTP} is your reset password OTP. This OTP is only valid for 15 minutes.`;

    const emailResponse = await sendEMail(to, subject, text);

    if (emailResponse !== "Email sent successfully!")
      throw new CustomError(501, "Something went wrong!");

    user.resetPasswordOTP = OTP;
    user.resetPasswordOTPExpiry = Date.now() + 15 * 60 * 1000;
    user.resetPasswordOTPVerified = false;

    await user.save();

    return res.status(201).json({
      success: true,
      messaage: "Email sent successfully!",
    });
  });

  // verify forgot password OTP

  verifyForgotPasswordOTP = asyncWrapper(async (req, res, next) => {
    const { otp, email } = req.body;

    const isValid = VerifyOTPSchema.safeParse({ email, OTP: otp });

    if (!isValid.success) {
      throw new CustomError(400, "Errors in received data!", isValid.error);
    }

    const user = await UsersModel.findOne({ email: email });

    if (user == null) throw new CustomError(404, "User not found!");

    // check OTP status

    if (
      user.resetPasswordOTP == null ||
      Date.now() > user.resetPasswordOTPExpiry
    )
      throw new CustomError(401, "Invalid credentials!");

    if (user.resetPasswordOTP !== otp)
      throw new CustomError(401, "Invalid OTP!");

    user.resetPasswordOTPVerified = true;
    user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified!",
    });
  });

  // reset password

  resetPassword = asyncWrapper(async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    const isValid = ResetPasswordSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    if (!isValid.success) {
      throw new CustomError(400, "Errors in received data!", isValid.error);
    }

    const user = await UsersModel.findOne({ email: email });

    if (user == null) throw new CustomError(401, "Invalid credentials!");

    if (
      Date.now() > user.resetPasswordOTPExpiry ||
      user.resetPasswordOTPVerified === false
    )
      throw new CustomError(401, "Invalid credentials!");

    // reset password
    const hashedPassword = await bcrypt.hash(isValid.data.password, 10);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    user.resetPasswordOTPVerified = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Reset password successfully!",
    });
  });

  // add friend

  addFriend = asyncWrapper(async (req, res, next) => {
    const userId = req.params.id;
    const loggedInUserId = req.user?._id;

    if (userId !== loggedInUserId?.valueOf())
      throw new CustomError(401, "Invalid credentials!");

    const { friendUsername } = req.body;

    const friend = await UsersModel.findOne({ username: friendUsername });

    if (friend == null) throw new CustomError(401, "Invalid credentials!");

    let updateResult = await UsersModel.updateOne(
      { _id: loggedInUserId },
      { $addToSet: { friends: friend._id } }
    );

    updateResult = await UsersModel.updateOne(
      { _id: friend._id },
      { $addToSet: { friends: loggedInUserId } }
    );

    if (!updateResult?.acknowledged)
      throw new CustomError(400, "Something went wrong!");

    return res.status(200).json({
      success: true,
      message: "Friend added successfully!",
    });
  });

  // get friends

  getFriends = asyncWrapper(async (req, res, next) => {
    const userId = req.params?.id;
    const loggedInUserId = req.user?._id;

    if (userId !== loggedInUserId?.valueOf())
      throw new CustomError(401, "Invalid credentials!");

    const user = await UsersModel.findById(loggedInUserId).populate({
      path: "friends",
      select: { id: "$_id", username: true, profileImage: true, _id: 0 },
    });
    // .populate(

    //   "friends",
    //   "_id username profileImage"
    // );

    if (user?.friends == null || !user?.friends?.length)
      throw new CustomError(404, "Friends not found!");

    return res.status(200).json({
      success: true,
      message: "Found friends",
      friends: user.friends,
    });
  });

  // find users

  findUsers = asyncWrapper(async (req, res, next) => {
    const search = req.query.search?.trim();

    // const users = await UsersModel.find(
    //   { username: new RegExp(search, "i") },
    //   { _id: true, username: true, profileImage: true }
    // );

    if (!search || search === "") throw new CustomError(404, "No users found!");

    const users = await UsersModel.find(
      {
        _id: { $ne: req.user?._id },
        username: { $regex: `${search}`, $options: "i" },
      },
      { id: "$_id", username: true, profileImage: true, _id: 0 }
    );

    if (users == null || !users?.length)
      throw new CustomError(404, "No users found!");

    return res.status(200).json({
      success: true,
      message: "Found users!",
      users: users,
    });
  });
}

function passportLocalAuthenticate(req, res, next, cb) {
  passport.authenticate("local", { session: false }, cb)(req, res, next);
}

module.exports = new UsersController();
