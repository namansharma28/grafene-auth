import * as nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });
};

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, name: string, otp: string) {
  try {
    const transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: `"Grafene Auth" <${process.env.SENDER_EMAIL || "grafene.webapp@gmail.com"}>`,
      to: email,
      subject: "Verify your Grafene Account - OTP Code",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d0d; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; color: #ffffff;">
          <div style="background-color: #000000; padding: 24px; text-align: center; border-bottom: 2px solid #FF4B33;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">GRAFENE</h1>
            <p style="color: #FF4B33; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Global Identity Service</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #ffffff; margin-top: 0;">Email Verification Code</h2>
            <p style="color: #cccccc; line-height: 1.6;">
              Hello ${name || 'User'}, thank you for registering with Grafene! Please use the 6-digit OTP code below to verify your email address:
            </p>
            <div style="background-color: rgba(255, 75, 51, 0.1); border: 1px solid #FF4B33; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
              <h1 style="color: #FF4B33; margin: 0; letter-spacing: 10px; font-size: 36px; font-family: monospace;">${otp}</h1>
            </div>
            <p style="color: #888888; line-height: 1.6; font-size: 14px;">
              This code will expire in 10 minutes. If you did not request this verification, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 25px 0;" />
            <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">
              &copy; ${new Date().getFullYear()} Grafene Community. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function sendPasswordResetOTP(email: string, name: string, tokenOrOtp: string) {
  try {
    const transporter = createTransporter();
    await transporter.verify();

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/auth/reset-password?token=${tokenOrOtp}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: `"Grafene Auth" <${process.env.SENDER_EMAIL || "grafene.webapp@gmail.com"}>`,
      to: email,
      subject: "Reset your Grafene Account Password",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d0d; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; color: #ffffff;">
          <div style="background-color: #000000; padding: 24px; text-align: center; border-bottom: 2px solid #FF4B33;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">GRAFENE</h1>
            <p style="color: #FF4B33; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Global Identity Service</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #ffffff; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #cccccc; line-height: 1.6;">
              We received a request to reset your password for your Grafene account. Click the button below to reset your password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #FF4B33; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; letter-spacing: 0.5px;">Reset Password</a>
            </div>
            <p style="color: #888888; line-height: 1.6; font-size: 14px;">
              Or enter the code below on the password reset page:
            </p>
            <div style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 12px; text-align: center; border-radius: 6px; margin: 15px 0;">
              <span style="color: #ffffff; font-size: 20px; font-family: monospace; letter-spacing: 4px;">${tokenOrOtp}</span>
            </div>
            <p style="color: #888888; line-height: 1.6; font-size: 13px;">
              This link and code will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 25px 0;" />
            <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">
              &copy; ${new Date().getFullYear()} Grafene Community. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send reset email:", error);
    throw new Error(`Failed to send reset email: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
