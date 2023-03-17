const BigPromise = require("../middlewares/bigPromise.js");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const Campaign = require("../models/campaign");

//sign up controller
exports.postData = BigPromise(async (req, res, next) => {
  //extract data
  const {
    title,
    description,
    fundsToBeRaised,
    country,
    cause,
    segregationOfAmount,
  } = req.body;

  // data validation
  if (
    !title ||
    !segregationOfAmount ||
    !description ||
    !fundsToBeRaised ||
    !country ||
    !cause
  ) {
    return next(new customError("All fields are mandatory are mandatory !"));
  }

  //saving document to db
  const campaign = await Campaign.create({
    title,
    description,
    fundsToBeRaised,
    country,
    cause,
    segregationOfAmount,
  });

  //generate and send cookieToken
  cookieToken(campaign, res);
});
