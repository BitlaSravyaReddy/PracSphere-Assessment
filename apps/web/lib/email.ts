import nodemailer from "nodemailer";
import { getOTPEmailTemplate, getOTPEmailText } from "./emailTemplates";

export interface SendOTPEmailParams {
  to: string;
  name: string;
  otp: string;
}

// Create a reusable transporter using Gmail SMTP or any other SMTP service
 
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Send OTP verification email using Nodemailer
export async function sendOTPEmail({
  to,
  name,
  otp,
}: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || "Karthavya"} <${process.env.SMTP_USER}>`,
      to: to,
      subject: "Verify Your Email - OTP Code",
      html: getOTPEmailTemplate(name, otp),
      text: getOTPEmailText(name, otp),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Exception sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}