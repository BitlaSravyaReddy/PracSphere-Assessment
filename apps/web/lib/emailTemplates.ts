// Generate HTML email template for OTP verification
export function getOTPEmailTemplate(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Email Verification</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">Hi ${name},</p>
              <p style="font-size: 16px; color: #333333; margin: 0 0 30px 0;">Thank you for signing up! Please use the following One-Time Password (OTP) to verify your email address:</p>
              
              <!-- OTP Box -->
              <div style="background-color: #f8f9fa; border: 2px dashed #4ECDC4; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #666666; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                <p style="font-size: 36px; color: #4ECDC4; margin: 0; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
              </div>
              
              <p style="font-size: 14px; color: #666666; margin: 20px 0;">This OTP will expire in <strong>10 minutes</strong>.</p>
              <p style="font-size: 14px; color: #666666; margin: 0;">If you didn't request this verification, please ignore this email.</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="font-size: 12px; color: #999999; margin: 0;">This is an automated message, please do not reply.</p>
              <p style="font-size: 12px; color: #999999; margin: 10px 0 0 0;">© ${new Date().getFullYear()} Your App. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate plain text version of OTP email. this is plain text that user gets to their email
export function getOTPEmailText(name: string, otp: string): string {
  return `
Hi ${name},

Thank you for signing up! Please use the following One-Time Password (OTP) to verify your email address:

Your OTP Code: ${otp}

This OTP will expire in 10 minutes.

If you didn't request this verification, please ignore this email.

---
This is an automated message, please do not reply.
© ${new Date().getFullYear()} Your App. All rights reserved.
  `.trim();
}