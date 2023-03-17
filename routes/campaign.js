const express = require("express");
const router = express.Router();

//calling controllers
const {
  postData,
  getAllCampaigns,
} = require("../controllers/campaignController");

//importing all the middlewares
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/list").get(getAllCampaigns);

//admin only routes
router.route("/admin/users/campaign").post(postData);

module.exports = router;
