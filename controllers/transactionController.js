const BigPromise = require("../middlewares/bigPromise.js");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const Transaction = require("../models/transaction");

//sign up controller
exports.postData = BigPromise(async (req, res, next) => {
  //extract data
  const {
    order_id,
    transaction_id,
    amountInDollars,
    fundsToBeRaised,
    remarks,
    status,
  } = req.body;

  // data validation
  if (!amountInDollars || !fundsToBeRaised || !remarks || !status) {
    return next(new customError("All fields are mandatory are mandatory !"));
  }

  //saving document to db
  const transaction = await Transaction.create({
    order_id,
    transaction_id,
    amountInDollars,
    fundsToBeRaised,
    remarks,
    status,
  });

  //generate and send cookieToken
  cookieToken(transaction, res);
});

// listen to hooks to set data
exports.razorPayWebHookListener = BigPromise(async (req, res, next) => {});
