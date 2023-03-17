//importing all the libraries required
const express = require("express");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
//create app from express
const app = express();

//morgan middleware
app.use(morgan("tiny"));
app.use(
  cors({
    origin: "*",
  })
);
//regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//temp view engine
app.set("view engine", "ejs");

// files and cookies middlewares
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(cookieParser());

//import all routes
const home = require("./routes/home");
const user = require("./routes/user");
const campaign = require("./routes/campaign");
const transaction = require("./routes/transaction");
const payment = require("./routes/payment");
const government = require("./routes/government");

//testing routes
app.get("/api/v1/signuptest", (req, res) => {
  res.render("signuptest");
});

//router middlewares
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", campaign);
app.use("/api/v1", transaction);
app.use("/api/v1", payment);
app.use("/api/v1", government);

//exporting app into index.js
module.exports = app;
