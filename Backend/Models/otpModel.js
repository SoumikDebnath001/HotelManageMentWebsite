const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete OTP document after 5 minutes of creation
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('OTP', otpSchema);
