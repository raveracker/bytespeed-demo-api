// Email validation function
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone number validation function
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const phoneNumberRegex = /^[0-9]{6,15}$/;
  return phoneNumberRegex.test(phoneNumber);
}
