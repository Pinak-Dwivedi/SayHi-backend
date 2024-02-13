module.exports = function createCookieOptions() {
  const NODE_ENV = process.env.NODE_ENV;

  return {
    httpOnly: true,
    maxAge: process.env.COOKIE_EXPIRY,
    sameSite: NODE_ENV === "development" ? "lax" : "none",
    secure: NODE_ENV === "development" ? false : true,
  };
};
