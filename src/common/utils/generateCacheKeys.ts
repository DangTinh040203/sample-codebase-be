export class GenerateCacheKeys {
  static userOtp(email: string) {
    return `userOtp:${email}`;
  }

  static otpFailed(email: string) {
    return `otpFailed:${email}`;
  }
}
