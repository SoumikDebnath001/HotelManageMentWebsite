const otpGenerator = require("otp-generator");
const OTP = require("../../../Models/otpModel");
const emailService = require("../../../service/emailService");
const otpService = require("../../../service/otpService");
const { z } = require("zod");
const {
  otpTemplate,
} = require("../../../Templates/Emails/auth/otp.template");

// ========================================================
// Validation
// ========================================================

const sendOtpSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(5).max(100),
});

const otpVerificationSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// ========================================================
// Send OTP
// ========================================================

const sendOtp = async (req, res) => {
  try {
    const result = sendOtpSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: false,
        message: "Invalid input",
        errors: result.error.issues,
      });
    }

    const { email, subject } = result.data;

    const sent = await otpService.sendOtp(
      email,
      subject
    );

    if (!sent) {
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP",
      });
    }

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
// ========================================================
// Verify OTP
// ========================================================

const verifyOtp = async (req, res) => {
  try {
    // Validate request body
    const result = otpVerificationSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or OTP",
        errors: result.error.issues,
      });
    }

    const { email, otp } = result.data;

    // Find latest valid OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      isUsed: false,
      expiresAt: {
        $gt: new Date(),
      },
    }).sort({
      createdAt: -1,
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

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

// ========================================================
// Export
// ========================================================

module.exports = {
  sendOtp,
  verifyOtp,
};