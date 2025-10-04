import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
export const sendResetPasswordEmail = async (to, token) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Восстановление пароля",
        html: `<p>Нажмите <a href="${resetLink}">здесь</a>, чтобы сбросить пароль.</p>`,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    }
    catch (error) {
        console.error("Ошибка при отправке письма:", error);
    }
};
//# sourceMappingURL=mailer.js.map