import * as nodemailer from "nodemailer";
import { ENV } from "../config/env.js";
import logger from "../config/logger.js";

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
    logger.info("Email sent:", { response: info.response });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Email send error:", { error: msg });
  }
};
