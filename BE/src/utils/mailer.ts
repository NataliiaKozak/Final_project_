import * as nodemailer from "nodemailer";
import { ENV } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (to: string, token: string): Promise<void> => {
  const resetLink = `${ENV.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: ENV.EMAIL_USER,
    to,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Email send error:", msg);
  }
};
