const Government = require("../models/government");
const BigPromise = require("../middlewares/bigPromise.js");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const mailHelper = require("../utils/mailHelper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

//sign up controller
exports.signup = BigPromise(async (req, res, next) => {
  //extract data
  const { ministry, email, password, country, organization, recentIP } =
    req.body;

  // data validation
  if (!ministry || !email || !password || !country || !organization) {
    return next(
      new customError("Ministry, Email, Organization, Password are mandatory !")
    );
  }

  //extract photo
  let photoResult = {
    public_id: process.env.DEFAULT_USER_PROFILE_ID,
    secure_url: process.env.DEFAULT_USER_PROFILE_SECURE_URL,
  };
  if (req.files) {
    //TODO: "FRONTEND FIELD SHOULD BE NAMED AS photo";
    let photo = req.files.photo;
    //upload to cloudinary
    photoResult = await cloudinary.uploader.upload(photo.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  //saving document to db
  const government = await Government.create({
    ministry,
    email,
    password,
    country,
    organization,
    recentIP,
    photo: {
      id: photoResult.public_id,
      secure_url: photoResult.secure_url,
    },
  });

  //generate and send cookieToken
  cookieToken(government, res);
});

//login controller
exports.login = BigPromise(async (req, res, next) => {
  const { email, password, privateKey } = req.body;

  //validation
  if (!email || !password || !privateKey) {
    return next(new customError("All fields are mandatory !", 400));
  }

  //get government  from the db
  const government = await Government.findOne({ email }).select("+password");

  //if government not found in database
  if (!government) {
    return next(
      new customError(
        "Email or password is incorrect or government not registered !",
        404
      )
    );
  }

  //check password
  const isPasswordCorrect = await government.isValidatedPassword(password);

  //password is incorrect
  if (!isPasswordCorrect) {
    return next(new customError("Email or password is incorrect !", 404));
  }

  //send cookie token
  cookieToken(government, res);
});

//logout controller
exports.logout = BigPromise(async (req, res, next) => {
  //clear logout token from cookie
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  //success response
  res.status(200).json({
    success: "true",
    message: "Logged out successfull !",
  });
});

// Needs to be discussed !

//forget password
exports.forgotpassword = BigPromise(async (req, res, next) => {
  //collect email
  const { email } = req.body;

  if (!email) {
    return next(new customError("Invalid email format !"));
  }

  //find government in db
  const government = await Government.findOne({ email });

  //if government not found in database
  if (!government) {
    return next(new customError("Email not found as registerd !"));
  }

  //get token from government model methods
  const forgotToken = government.getForgotPasswordToken();

  //save government fileds in databse
  await government.save({ validateBeforeSave: false });

  //create a URL
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  //craft a message
  const message = `Copy paste this link in URL and hit enter \n\n ${myUrl}`;

  //attempt to send email
  try {
    await mailHelper({
      email: government.email,
      subject: "Password Reset",
      message,
    });

    //send json response for success
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    //reset government fields if not success
    government.forgotPasswordToken = undefined;
    government.forgotPasswordExpiry = undefined;
    await government.save({ validateBeforeSave: false });

    //send error response
    return next(new customError(error.message, 500));
  }
});

//password reset
exports.passwordReset = BigPromise(async (req, res, next) => {
  //get token from params
  const token = req.params.token;

  // hash the token as db also stores the hashed version
  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  // find government based on hased on token and time in future
  const government = await Government.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!government) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  // check if password and conf password matched
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("password and confirm password do not match", 400)
    );
  }

  // update password field in DB
  government.password = req.body.password;

  // reset token fields
  governmentuser.forgotPasswordToken = undefined;
  government.forgotPasswordExpiry = undefined;

  // save the government
  await government.save();

  // send a JSON response OR send token

  cookieToken(government, res);
});

//send details to userdashboard
exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const government = await Government.findById(req.government.id);

  res.status(200).json({
    success: true,
    government,
  });
});

//change password
exports.changePassword = BigPromise(async (req, res, next) => {
  //grab government from db
  const government = await Government.findById(req.government.id).select(
    "+password"
  );
  if (!government) {
    return next(new customError("Log In first to access !", 400));
  }
  //compare password
  const isCorrectOldPassword = await government.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isCorrectOldPassword) {
    return next(new customError("Old password is incorrect", 400));
  }

  //update to new password
  government.password = req.body.newPassword;

  //save to database
  await government.save();

  //send updated cookie token
  cookieToken(government, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  //checking the data
  if (!(req.body.name && req.body.email)) {
    return next(
      new customError("Please provide all the data while updating !", 400)
    );
  }

  //collect data from the body
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  //if photo is also update
  if (req.files && req.files.photo) {
    const government = await User.findById(req.government.id);

    const imageId = government.photo.id;

    //delet photo on cloudinary
    await cloudinary.uploader.destroy(imageId);

    //upload the new photo
    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    //add photo data in new data object
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  //update the data in government
  const government = await government.findByIdAndUpdate(
    req.government.id,
    newData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

//get all users info : ADMIN ONLY ROUTE
exports.adminShowAllUsers = BigPromise(async (req, res, next) => {
  //get all users from database
  const users = await User.find();

  //return all users
  res.status(200).json({
    success: true,
    users,
  });
});

//get all users info : MANAGER ONLY ROUTE
exports.managerShowAllUsers = BigPromise(async (req, res, next) => {
  //get all users from database
  const users = await User.find({ role: "government" });

  //return all users
  res.status(200).json({
    success: true,
    users,
  });
});

//get single government info admin
exports.admingetOneUser = BigPromise(async (req, res, next) => {
  // get id from url and get government from database
  const government = await User.findById(req.params.id);

  if (!government) {
    next(new CustomError("No government found", 400));
  }

  // send government
  res.status(200).json({
    success: true,
    government,
  });
});

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  // add a check for email and name in body

  // get data from request body
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  // update the government in database
  const government = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  // get government from url
  const government = await Government.findById(req.params.id);

  if (!government) {
    return next(new CustomError("No Such government found", 401));
  }

  // get image id from government in database
  const imageId = government.photo.id;

  // delete image from cloudinary
  await cloudinary.v2.uploader.destroy(imageId);

  // remove government from databse
  await government.remove();

  res.status(200).json({
    success: true,
  });
});
