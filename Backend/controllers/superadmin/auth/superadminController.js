const mongoose = require("mongoose");
const Admin = require("../../../Models/superadmin");
const HotelAdmin = require("../../../Models/admin");
const User = require("../../../Models/user");
const { Validator } = require("node-input-validator");
const { adminRegisterSchema } = require("../../../validators/superAdmin.validator");
const passwordHash = require("password-hash");
const otpService = require("../../../service/otpService");
const OTP = require("../../../Models/otpModel");
var jwt = require("jsonwebtoken");

function createToken(data) {
  return jwt.sign(data, "DonateSmile");
}

const getTokenData = async (token) => {
  let adminData = await Admin.findOne({ token: token }).exec();
  return adminData;
};
//=========================================================================== Register Admin
const register = async (req, res) => {
  //================================= zod validation
  const inputs = adminRegisterSchema.safeParse(req.body);

  if (!inputs.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: inputs.error.issues,
    });
  }

  // ================================= validated data
  const { name, email, password } = inputs.data;

  const adminData = {
    name,
    email,
    password,
    token: createToken({ email }),
  };

  try {
    const adminInsert = new Admin(adminData);
    await adminInsert.save();

    return res.status(201).json({
      status: true,
      message: "Admin created successfully",
      data: adminInsert,
    });

  } catch (error) {
    // Duplicate email
    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
        field: Object.keys(error.keyPattern)[0],
      });
    }

    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
//=========================================================================== Admin Login

const login = async (req, res) => {
  const v = new Validator(req.body, {
    email: "required|email",
    password: "required",
  });

  const matched = await v.check();

  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
    });
  }

  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const passwordMatched = await admin.comparePassword(password);

    if (!passwordMatched) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Send OTP
    const otpSent = await otpService.sendOtp(
      admin.email,
      "Admin Login Verification"
    );

    if (!otpSent) {
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP",
      });
    }

    // IMPORTANT:
    // Admin is NOT logged in yet.
    return res.status(200).json({
      status: true,
      otpRequired: true,
      message: "OTP sent to your email",
      data: {
        email: admin.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
//=========================================================================== Verify OTP
const verifyOtp = async (req, res) => {
  const v = new Validator(req.body, {
    email: "required|email",
    otp: "required",
  });

  const matched = await v.check();
  if (!matched) {
    return res.status(400).json({
      status: false,
      error: v.errors,
      message: "Validation failed",
    });
  }

  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    // Prepare response data
    const adminData = admin.toObject();
    delete adminData.password; // Do not send password

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
      data: adminData,
      token: adminData.token,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
//=========================================================================== View Admin Profile
const getMyProfile = async (req, res) => {
  try {
    const adminData = await Admin.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(req.user._id)),
        },
      },
    ]);

    if (adminData.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    const admin = adminData[0];
    admin.password = null; // Hide password from response
    admin.token = null; // Hide token from response
    return res.status(200).json({
      status: true,
      message: "Profile fetched successfully",
      data: admin,
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

//=========================================================================== Create Hotel Admin
const createAdmin = async (req, res) => {
  const v = new Validator(req.body, {
    email: "required|email",
  });

  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const existingAdmin = await HotelAdmin.findOne({ email: req.body.email, isDeleted: false });
    if (existingAdmin) {
      return res.status(400).json({ status: false, message: "Admin already exists with this email" });
    }

    const adminInsert = new HotelAdmin({
      name: req.body.name ? req.body.name : req.body.email,
      email: req.body.email,
      password: req.body.email,
      token: createToken({ email: req.body.email, createdOn: new Date() }),
      isDefaultPassword: true,
      createdOn: new Date(),
    });
    await adminInsert.save();
    adminInsert.password = null;

    return res.status(201).json({
      status: true,
      message: "Admin created successfully, default password is the admin email",
      data: adminInsert,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: false, message: "Email already exists" });
    }
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await HotelAdmin.find({ isDeleted: false }).select("-password -token");
    return res.status(200).json({ status: true, message: "Admins fetched successfully", data: admins });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  const v = new Validator(req.body, { adminId: "required" });
  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const admin = await HotelAdmin.findOne({ _id: req.body.adminId, isDeleted: false });
    if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });

    ["name", "isActive"].forEach((field) => {
      if (typeof req.body[field] != "undefined") admin[field] = req.body[field];
    });
    await admin.save();
    admin.password = null;
    admin.token = null;
    return res.status(200).json({ status: true, message: "Admin updated successfully", data: admin });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  const v = new Validator(req.body, { adminId: "required" });
  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const admin = await HotelAdmin.findOne({ _id: req.body.adminId, isDeleted: false });
    if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });
    admin.isDeleted = true;
    admin.isActive = false;
    await admin.save();
    return res.status(200).json({ status: true, message: "Admin deleted successfully", data: admin });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

//=========================================================================== User Management
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select("-password -token");
    return res.status(200).json({ status: true, message: "Users fetched successfully", data: users });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  const v = new Validator(req.body, { userId: "required", isActive: "required|boolean" });
  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const user = await User.findOne({ _id: req.body.userId, isDeleted: false });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    user.isActive = req.body.isActive;
    await user.save();
    
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.token;

    return res.status(200).json({ status: true, message: "User status updated", data: userObj });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const v = new Validator(req.body, { userId: "required" });
  if (!(await v.check())) {
    return res.status(400).json({ status: false, error: v.errors, message: "Validation failed" });
  }

  try {
    const user = await User.findOne({ _id: req.body.userId, isDeleted: false });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    user.isDeleted = true;
    user.isActive = false;
    await user.save();
    return res.status(200).json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  getTokenData,
  login,
  verifyOtp,
  getMyProfile,
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  getAllUsers,
  updateUserStatus,
  deleteUser,
};
