const jwt = require("jsonwebtoken");

module.exports = function createJwtToken(payload, isLogout = false) {
  if (isLogout) {
    const token = jwt.sign(payload, process.env.JWT_LOGOUT_SECRET, {
      expiresIn: "1ms",
    });

    return token;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  return token;
};
