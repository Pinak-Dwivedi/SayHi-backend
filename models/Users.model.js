const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },

  username: {
    type: String,
    minLength: 5,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    minLength: 8,
    // required: true, removing required setting for loggin with google
  },

  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  resetPasswordOTP: String,
  resetPasswordOTPExpiry: Date,
  resetPasswordOTPVerified: Boolean,

  profileImage: String,
  profileImagePublicId: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: "user",
  },
});

UserSchema.virtual("userInfo").get(function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    profileImage: this.profileImage,
    role: this.role === "admin" ? "admin" : undefined,
  };
});

UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", UserSchema);
