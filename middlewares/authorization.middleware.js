module.exports = function checkAuthorized(req, res, next) {
  if (req.user?.role === "admin") return next();

  return res.status(403).json({
    success: false,
    message: "Not authorized!",
  });
};
