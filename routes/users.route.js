const router = require("express").Router();
const usersController = require("../controllers/Users.controller");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/autthentication.middleware");
const checkAuthroized = require("../middlewares/authorization.middleware");
const UsersController = require("../controllers/Users.controller");

router.get("/dummy", checkAuthenticated, checkAuthroized, (req, res, next) => {
  return res.send("authroized");
});

router.get("/auth", checkAuthenticated, usersController.auth);
router.post("/register", checkNotAuthenticated, usersController.register);
router.post("/login", checkNotAuthenticated, usersController.login);
router.post(
  "/loginWithGoogle",
  checkNotAuthenticated,
  usersController.loginWithGoogle
);
router.delete("/logout", checkAuthenticated, usersController.logout);

router.put(
  "/resetPassword",
  checkNotAuthenticated,
  usersController.resetPassword
);

router.post(
  "/forgotPassword",
  checkNotAuthenticated,
  usersController.forgotPassword
);
router.post(
  "/verifyOTP",
  checkNotAuthenticated,
  usersController.verifyForgotPasswordOTP
);

router.put("/:id/friends", checkAuthenticated, UsersController.addFriend);

router.put("/:id", checkAuthenticated, usersController.update);

router.get("/", checkAuthenticated, UsersController.findUsers);

router.get("/:id/friends", checkAuthenticated, UsersController.getFriends);

module.exports = router;
