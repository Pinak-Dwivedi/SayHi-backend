const router = require("express").Router();
const usersController = require("../controllers/Users.controller");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/autthentication.middleware");
const checkAuthroized = require("../middlewares/authorization.middleware");

router.get("/dummy", checkAuthenticated, checkAuthroized, (req, res, next) => {
  return res.send("authroized");
});
router.post("/register", checkNotAuthenticated, usersController.register);
router.post("/login", checkNotAuthenticated, usersController.login);

module.exports = router;
