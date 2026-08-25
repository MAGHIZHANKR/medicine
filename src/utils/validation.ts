/**
 * Input validation helpers
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
}

export function isValidCaregiverCode(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  return /^MED-[A-Z0-9]{4,6}$/.test(clean) || /^[A-Z0-9]{4,8}$/.test(clean);
}

export function generateCaregiverCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MED-${randomStr}`;
}

export interface MedicineFormErrors {
  name?: string;
  dosage?: string;
  time?: string;
  startDate?: string;
  endDate?: string;
}

export function validateMedicineForm(data: {
  name: string;
  dosage: string;
  time: string;
  startDate: string;
  endDate?: string;
}): { isValid: boolean; errors: MedicineFormErrors } {
  const errors: MedicineFormErrors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Medicine name is required';
  } else if (data.name.length > 80) {
    errors.name = 'Medicine name is too long (max 80 characters)';
  }

  if (!data.dosage || data.dosage.trim().length === 0) {
    errors.dosage = 'Dosage is required (e.g. "1 tablet", "500mg")';
  }

  if (!data.time || data.time.trim().length === 0) {
    errors.time = 'Reminder time is required';
  }

  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.endDate = 'End date cannot be earlier than start date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
