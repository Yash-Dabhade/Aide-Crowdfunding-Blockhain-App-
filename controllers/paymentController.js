const BigPromise = require("../middlewares/bigPromise");
// const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Razorpay = require("razorpay");

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    razorpaykey: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
  const data = req.body.data;

  if (!data) {
    res.status(400).json({
      success: "false",
    });
  }

  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  var options = {
    amount: req.body.amount, // amount in the smallest currency unit
    currency: "INR",
  };
  const myOrder = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    order: myOrder,
  });
});
