const mongoose = require("mongoose");
const User = require("../../../Models/user");
const {userRegistration} = require("../../../validators/user.validator");
const { Validator } = require("node-input-validator");
const passwordHash = require("password-hash");
var jwt = require("jsonwebtoken");
//argon 2  for pass hashing 
//crypto fro encryption AES-256 node js by default
function createToken(data) {
  return jwt.sign(data, "DonateSmile");
}

const getTokenData = async (token) => {
  let userData = await User.findOne({ token: token, isDeleted: false }).exec();
  return userData;
};
const data ={
    email: "required|email",
    password: "required",
  }

//================================================================================================================= Register User
const register = async (req, res) => {
  const v = new Validator(req.body,data );

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    const existingUser = await User.findOne({ email: req.body.email, isDeleted: false });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists with this email",
      });
    }

    let userData = {
      ...req.body,
      password: passwordHash.generate(req.body.password),
      token: createToken({ email: req.body.email, createdOn: new Date() }),
      contact: {
        ...req.body.contact,
        email: (req.body.contact && req.body.contact.email) ? req.body.contact.email : req.body.email,
      },
      createdOn: new Date(),
    };

    const userInsert = new User(userData);
    await userInsert.save();

    userInsert.password = null; // Hide password from response
    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: userInsert,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//================================================================================================================= Login User
const login = async (req, res) => {
  const v = new Validator(req.body, {
    email: "required",
    password: "required",
  });

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({ status: false, error: v.errors });
  }

  try {
    const user = await User.findOne({ email: req.body.email, isDeleted: false });

    if (user && !user.isActive) {
      return res.status(401).json({
        status: false,
        message: "Your account is deactivated, please contact admin",
      });
    }

    if (user && user.comparePassword(req.body.password)) {
      user.password = null; // Hide password from response
      return res.status(200).json({
        status: true,
        message: "User logged in successfully",
        data: user,
      });
    } else {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//================================================================================================================= View User Profile
const getMyProfile = async (req, res) => {
    try {
      const userData = await User.aggregate([
        {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.user._id)),
          isDeleted: false,
        },
      },
    ]);

    if (userData.length == 0) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const user = userData[0];
    user.password = null; // Hide password from response
    user.token = null; // Hide token from response
    return res.status(200).json({
      status: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//================================================================================================================= Change Password (by User)
const changePassword = async (req, res) => {
  const v = new Validator(req.body, {
    oldPassword: "required",
    newPassword: "required|minLength:6",
  });

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (!user.comparePassword(req.body.oldPassword)) {
      return res.status(401).json({
        status: false,
        message: "Old password is incorrect",
      });
    }

    if (req.body.oldPassword == req.body.newPassword) {
      return res.status(400).json({
        status: false,
        message: "New password must be different from old password",
      });
    }

    user.password = passwordHash.generate(req.body.newPassword);
    user.token = createToken({ email: user.email, createdOn: new Date() });
    await user.save();

    user.password = null; // Hide password from response
    return res.status(200).json({
      status: true,
      message: "Password changed successfully, please login again with new password",
      data: user,
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Forgot Password (public) - generates a temporary password, user should change it after login
const otpController = require('../../shared/otp/otpController');
//================================================================================================================= Forgot Password (by User)
const forgotPassword = async (req, res, next) => {
  const v = new Validator(req.body, {
    email: "required|email",
  });

  let matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    const user = await User.findOne({ email: req.body.email, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found with this email",
      });
    }

    // Call the sendOtp function from otpController
    return otpController.sendOtp(req, res);
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
//================================================================================================================= Update User Profile (by User)
const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const allowedFields = [
      "firstMiddleName",
      "lastName",
      "image",
      "gender",
      "dateOfBirth",
      "nationalityid",
      "nationalityName",
      "maritalStatus",
      "anniversary",
      "cityId",
      "cityName",
      "stateId",
      "stateName",
      "contact",
      "documents",
    ];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] != "undefined") {
        user[field] = req.body[field];
      }
    });

    await user.save();

    user.password = null; // Hide password from response
    user.token = null; // Hide token from response
    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  getTokenData,
  login,
  getMyProfile,
  changePassword,
  forgotPassword,
  updateMyProfile,

};
