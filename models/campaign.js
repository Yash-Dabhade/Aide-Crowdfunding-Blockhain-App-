const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: [true, "Please provide a name"],
    // maxlength: [40, "Name should be under 40 chars"],
  },
  description: {
    type: String,
    // required: [true, "Please provide an email"],
    // validate: [validator.isEmail, "Please provide email in correct format !"],
    unique: true,
  },
  fundsToBeRaised: {
    type: String,
    // required: [true, "Please provide a password"],
    // minlength: [6, "Password must be atleast of 6 char"],
  },
  photo: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  country: {
    type: String,
  },
  segregationOfAmount: {
    type: [
      {
        organizationName: String,
        organizationCode: String,
        rate: String,
      },
    ],
  },
  cause: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // don't write with paranthesis to make it execute when instance is created
  },
});

module.exports = mongoose.model("Campaign", campaignSchema);
