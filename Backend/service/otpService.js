const otpGenerator = require("otp-generator");
const OTP = require("../Models/otpModel");
const emailService = require("./emailService");

const {
  otpTemplate,
} = require("../Templates/Emails/auth/otp.template");

/**
 * Generate, store and send OTP
 *
 * @param {string} email
 * @param {string} subject
 * @returns {Promise<boolean>}
 */
const sendOtp = async (email, subject) => {
  try {
    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiry = 5;

    const expiresAt = new Date(
      Date.now() + expiry * 60 * 1000
    );

    // Remove previous OTP
    await OTP.deleteMany({ email });

    // Save new OTP
    await OTP.create({
      email,
      otp,
      expiresAt,
    });

    // Generate email template
    const html = otpTemplate({
      name: "Dear Customer",
      otp,
      expiry,
    });

    // Send email
    const emailSent = await emailService.sendEmail(
      email,
      subject,
      `Your OTP is ${otp}. It expires in ${expiry} minutes.`,
      html
    );

    // Email failed
    if (!emailSent) {
      await OTP.deleteMany({
        email,
        otp,
      });

      return false;
    }

    return true;

  } catch (error) {
    console.error("OTP Service Error:", error);

    return false;
  }
};

module.exports = {
  sendOtp,
};