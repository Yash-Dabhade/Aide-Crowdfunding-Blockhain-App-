const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
  },
  transaction_id: {
    type: String,
    required: true,
  },
  amountInDollars: {
    type: String,
    // required: [true, "Please provide a name"],
    // maxlength: [40, "Name should be under 40 chars"],
  },
  status: {
    type: String,
    default: "Fail",
    // required: [true, "Please provide an email"],
    // validate: [validator.isEmail, "Please provide email in correct format !"],
  },
  fundsToBeRaised: {
    type: String,
    // required: [true, "Please provide a password"],
    // minlength: [6, "Password must be atleast of 6 char"],
  },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  supplyChain: {
    type: [
      {
        status: String,
        remarks: String,
        updatedBy: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  remarks: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // don't write with paranthesis to make it execute when instance is created
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
