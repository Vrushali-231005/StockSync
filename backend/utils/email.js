import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env

// transporter must be defined here, outside the function
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



export const sendEmail = async (to, subject, text, html) => {
  try {
    console.log("📩 Attempting to send email...");
    console.log("From:", process.env.EMAIL_USER);
    console.log("To:", to);

    const info = await transporter.sendMail({
      from: `"StockSync" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // fallback
      html, // HTML content
    });

    console.log("✅ Email sent successfully:", info.response);
    return true;
  } catch (err) {
    console.error("❌ Email send failed");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    return false;
  }
};
