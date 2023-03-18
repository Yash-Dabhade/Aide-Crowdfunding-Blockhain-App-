const express = require("express");
const router = express.Router();

//calling controllers
const {
  postData,
  getAllCampaigns,
} = require("../controllers/campaignController");

//importing all the middlewares
const { isLoggedIn, customRole } = require("../middlewares/user");
const campaign = require("../models/campaign");

router.route("/list").get(getAllCampaigns);

router.get("/created/:id", (req, res) => {
  campaign
    .find({ createdBy: req.params.id })
    .then((data) => {
      if (data) {
        res.send({ data, success: true });
      }
    })
    .catch((err) => {
      res.status(500).send({
        err: err,
        success: false,
      });
    });
});

//admin only routes
router.route("/admin/users/campaign").post(postData);

module.exports = router;
