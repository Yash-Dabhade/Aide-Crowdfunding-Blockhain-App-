const express = require("express");
const router = express.Router();

//calling controllers
const { postData } = require("../controllers/transactionController");

//importing all the middlewares
const { isLoggedIn, customRole } = require("../middlewares/user");

//admin only routes
router
  .route("/admin/transactions")
  .post(isLoggedIn, customRole("admin"), postData);

module.exports = router;
