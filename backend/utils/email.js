import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email function
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"StockSync" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // fallback
      html, // HTML content
    });
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};
