const mongoose = require("mongoose");
const Employee = require("../../../Models/employee");
const {employeeRegistration} = require("../../../validators/employee.validator");
const { Validator } = require("node-input-validator");
const passwordHash = require("password-hash");
const otpService = require("../../../service/otpService");
var jwt = require("jsonwebtoken");

function createToken(data) {
  return jwt.sign(data, "DonateSmile");
}

const getTokenData = async (token) => {
  let employeeData = await Employee.findOne({ token: token, isDeleted: false }).exec();
  return employeeData;
};

// Employee Login
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
    const employee = await Employee.findOne({ email: req.body.email, isDeleted: false });

    if (employee && !employee.isActive) {
      return res.status(401).json({
        status: false,
        message: "Your account is deactivated, please contact admin",
      });
    }

    if (employee && employee.comparePassword(req.body.password)) {
      employee.password = null; // Hide password from response
      return res.status(200).json({
        status: true,
        message: employee.isDefaultPassword
          ? "Logged in with default password, please change your password"
          : "Employee logged in successfully",
        mustChangePassword: employee.isDefaultPassword,
        data: employee,
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

// Change Password (first login with default password or anytime after)
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
    const employee = await Employee.findOne({ _id: req.user._id, isDeleted: false });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    if (!employee.comparePassword(req.body.oldPassword)) {
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

    employee.password = passwordHash.generate(req.body.newPassword);
    employee.isDefaultPassword = false;
    employee.token = createToken({ email: employee.email, role: employee.role, createdOn: new Date() });
    await employee.save();

    employee.password = null; // Hide password from response
    return res.status(200).json({
      status: true,
      message: "Password changed successfully, please login again with new password",
      data: employee,
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
// Employee Forgot Password
const forgotPassword = async (req, res) => {
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
    const employee = await Employee.findOne({ email: req.body.email, isDeleted: false });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found with this email",
      });
    }

    const otpSent = await otpService.sendOtp(
      employee.email,
      "Employee Password Reset Verification"
    );

    if (!otpSent) {
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP email",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Password reset OTP sent to your email",
      data: {
        email: employee.email,
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// View Employee Profile
const getMyProfile = async (req, res) => {
  try {
    const employeeData = await Employee.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.user._id)),
          isDeleted: false,
        },
      },
    ]);

    if (employeeData.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    const employee = employeeData[0];
    employee.password = null; // Hide password from response
    employee.token = null; // Hide token from response
    return res.status(200).json({
      status: true,
      message: "Profile fetched successfully",
      data: employee,
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

module.exports = {
  forgotPassword,
  getTokenData,
  login,
  changePassword,
  getMyProfile,

};
