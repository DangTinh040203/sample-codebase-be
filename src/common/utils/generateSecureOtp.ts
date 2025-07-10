import * as crypto from 'crypto';

export function generateSecureOtp(number: number = 6): string {
  const buffer = crypto.randomBytes(3);
  const otp = buffer.readUIntBE(0, 3) % 1000000;
  return otp.toString().padStart(number, '0');
}
