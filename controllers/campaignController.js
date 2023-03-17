const BigPromise = require("../middlewares/bigPromise.js");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const Campaign = require("../models/campaign");

exports.getAllCampaigns = BigPromise(async (req, res, next) => {
  Campaign.find({})
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: {
          data,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "fail",
        message: err,
      });
    });
});

exports.getCampaign = BigPromise(async (req, res, next) => {
  Campaign.findById(req.params.id)
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: {
          data,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "fail",
        message: err,
      });
    });
});

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
    createdBy,
  } = req.body;
  console.log(req.body);

  // data validation
  if (
    !title ||
    !segregationOfAmount ||
    !description ||
    !fundsToBeRaised ||
    !country ||
    !cause ||
    !createdBy
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
    createdBy,
  });

  //generate and send cookieToken
  cookieToken(campaign, res);
});
