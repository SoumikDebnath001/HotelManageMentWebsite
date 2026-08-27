const mongoose = require("mongoose");
const Admin = require("../../../Models/admin");
const { Validator } = require("node-input-validator");
const passwordHash = require("password-hash");
var jwt = require("jsonwebtoken");
const otpService = require("../../../service/otpService");
const OTP = require("../../../Models/otpModel");

function createToken(data) {
  return jwt.sign(data, "DonateSmile");
}

const getTokenData = async (token) => {
  return Admin.findOne({ token: token, isDeleted: false }).exec();
};

const login = async (req, res) => {
  const v = new Validator(req.body, { email: "required|email", password: "required" });
  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const admin = await Admin.findOne({ email: req.body.email, isDeleted: false });
    if (!admin || !admin.isActive || !admin.comparePassword(req.body.password)) {
      return res.status(401).json({ status: false, message: "Invalid email or password" });
    }

    admin.password = null;
    return res.status(200).json({
      status: true,
      message: admin.isDefaultPassword
        ? "Logged in with default password, please change your password"
        : "Admin logged in successfully",
      mustChangePassword: admin.isDefaultPassword,
      data: admin,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const sendChangePasswordOtp = async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.user._id, isDeleted: false });
    if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });

    const otpSent = await otpService.sendOtp(
      admin.email,
      "Admin Password Change"
    );

    if (!otpSent) {
      return res.status(500).json({ status: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({ status: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Admin send change password OTP error:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const changePassword = async (req, res) => {
  const v = new Validator(req.body, { otp: "required", newPassword: "required|minLength:6" });
  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const admin = await Admin.findOne({ _id: req.user._id, isDeleted: false });
    if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: admin.email,
      otp: req.body.otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    admin.password = req.body.newPassword;
    admin.isDefaultPassword = false;
    admin.token = createToken({ email: admin.email, createdOn: new Date() });
    await admin.save();
    
    admin.password = null;
    return res.status(200).json({ status: true, message: "Password changed successfully, please login again with new password", data: admin });
  } catch (error) {
    console.error("Admin change password error:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.user._id, isDeleted: false }).lean();
    if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });
    admin.password = null;
    admin.token = null;
    return res.status(200).json({ status: true, message: "Profile fetched successfully", data: admin });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

module.exports = { getTokenData, login, changePassword, getMyProfile, sendChangePasswordOtp };
