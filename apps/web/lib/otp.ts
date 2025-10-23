import bcrypt from "bcrypt";

// Generate a random 6-digit OTP
 
export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

// Hash the OTP before storing in database
 
export async function hashOTP(otp: string): Promise<string> {
  return await bcrypt.hash(otp, 10);
}

// Verify OTP against hashed version
 
export async function verifyOTP(
  otp: string,
  hashedOTP: string
): Promise<boolean> {
  return await bcrypt.compare(otp, hashedOTP);
}

//Get OTP expiry time (10 minutes from now)
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
}

//Check if OTP has expired
export function isOTPExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}