const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UsersModel = require("../models/Users.model");
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const user = await UsersModel.findOne({ username: username });

      if (user == null) return cb(null, false, { message: "User not found!" });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return cb(null, false, { message: "Incorrect password!" });

      return cb(null, user);
    } catch (error) {
      return cb(error, false, { message: "Something went wrong!" });
    }
  })
);

const passportJWT = require("passport-jwt");
const JWTStategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const options = {
  // jwtFromRequest: jwtExtractor,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JWTStategy(options, async function (payload, done) {
    try {
      const user = await UsersModel.findOne({ _id: payload.userId });

      if (user == null)
        return done(null, false, { message: "User not found!" });

      return done(null, user);
    } catch (error) {
      return done(error, false, { message: "Something went wrong!" });
    }
  })
);

function jwtExtractor(req) {
  const token = req?.cookies?.token;

  return token;
}
