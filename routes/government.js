const express = require("express");
const router = express.Router();

//calling controllers
const {
  signup,
  login,
  logout,
  forgotpassword,
  passwordReset,
} = require("../controllers/governmentController");

//importing all the middlewares
const { isLoggedIn, customRole } = require("../middlewares/user");

//setting user routes
router.route("/government/signup").post(signup);
router.route("/government/login").post(login);
router.route("/government/logout").get(logout);
router.route("/government/forgotpassword").post(forgotpassword);
router.route("/government/password/reset/:token").post(passwordReset);
//injecting first middleware and then user controller function

module.exports = router;
