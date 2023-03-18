const express = require("express");
const router = express.Router();

//calling controllers
const { postData } = require("../controllers/transactionController");

//importing all the middlewares
const { isLoggedIn, customRole } = require("../middlewares/user");
const { translateAliases } = require("../models/transaction");
const transaction = require("../models/transaction");

router.get("/userTransactions", (req, res) => {
  transaction.find({ createdBy: req.body.id }).then((data) => {
    if (data) {
      res.send({
        data,
        success: true,
      });
    }
  });
});

router.post("/saveTransactions", (req, res) => {});

//admin only routes
router.route("/admin/transactions").post(postData);

module.exports = router;
