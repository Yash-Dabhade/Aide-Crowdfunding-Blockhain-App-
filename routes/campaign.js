const express = require("express");
const router = express.Router();

//calling controllers
const { postData } = require("../controllers/campaignController");

//importing all the middlewares
const { isLoggedIn, customRole } = require("../middlewares/user");

//admin only routes
// router
//   .route("/admin/users/campaign")
//   .post(isLoggedIn, customRole("admin"), postData);

module.exports = router;
