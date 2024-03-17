const router = require("express").Router();
const messageController = require("../controllers/Messages.controller");
const {
  checkAuthenticated,
} = require("../middlewares/autthentication.middleware");

router.get("/", checkAuthenticated, messageController.getMessages);
router.post("/", checkAuthenticated, messageController.addMessage);

module.exports = router;
