const passport = require("passport");

exports.checkAuthenticated = (req, res, next) => {
  passportJwtAuthenticate(req, res, next, (error, user, info) => {
    if (user) {
      req.user = user;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Not authenticted!",
    });
  });
};

exports.checkNotAuthenticated = (req, res, next) => {
  passportJwtAuthenticate(req, res, next, (error, user, info) => {
    if (!user) return next();

    return res.status(401).json({
      success: false,
      message: "Already authenticated!",
    });
  });
};

function passportJwtAuthenticate(req, res, next, cb) {
  passport.authenticate("jwt", { session: false }, cb)(req, res, next);
}
