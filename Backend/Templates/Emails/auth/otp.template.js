// Templates/Emails/auth/otp.template.js

export const otpTemplate = ({ otp, expiry }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification</title>
      </head>

      <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">

        <div style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          padding:30px;
          border-radius:10px;
        ">

          <h2>Hello Dear customer,</h2>

          <p>
            Please use the following OTP to verify your email address.
          </p>

          <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
            text-align:center;
            padding:20px;
            margin:25px 0;
            background:#f1f1f1;
            border-radius:8px;
          ">
            ${otp}
          </div>

          <p>
            This OTP will expire in <strong>${expiry} minutes</strong>.
          </p>

          <p>
            If you did not request this verification, please ignore this email.
          </p>

          <hr />

          <p style="font-size:12px; color:#777;">
            Hotel Management System
          </p>

        </div>

      </body>
    </html>
  `;
};