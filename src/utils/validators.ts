// Form validation utilities

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) return { valid: false, error: "Email is required" };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  if (email.length > 255) {
    return { valid: false, error: "Email must be less than 255 characters" };
  }
  
  return { valid: true };
};

export const validatePassport = (passport: string): { valid: boolean; error?: string } => {
  if (!passport) return { valid: false, error: "Passport number is required" };
  
  const cleaned = passport.replace(/\s/g, '').toUpperCase();
  
  // Alphanumeric, 6-9 characters
  if (!/^[A-Z0-9]{6,9}$/.test(cleaned)) {
    return { valid: false, error: "Passport must be 6-9 alphanumeric characters" };
  }
  
  return { valid: true };
};

export const validateDateFormat = (dateStr: string): { valid: boolean; error?: string } => {
  if (!dateStr) return { valid: true }; // Optional field
  
  // DD.MM.YYYY format
  const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = dateStr.match(regex);
  
  if (!match) {
    return { valid: false, error: "Date must be in DD.MM.YYYY format" };
  }
  
  const [, day, month, year] = match;
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  
  if (d < 1 || d > 31) {
    return { valid: false, error: "Day must be between 01 and 31" };
  }
  
  if (m < 1 || m > 12) {
    return { valid: false, error: "Month must be between 01 and 12" };
  }
  
  if (y > 2030) {
    return { valid: false, error: "Year cannot exceed 2030" };
  }
  
  // Validate actual date
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return { valid: false, error: "Invalid date" };
  }
  
  return { valid: true };
};

export const formatDateToDDMMYYYY = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}.${month}.${year}`;
};

export const parseDDMMYYYYToDate = (dateStr: string): Date | null => {
  const validation = validateDateFormat(dateStr);
  if (!validation.valid) return null;
  
  const [day, month, year] = dateStr.split('.').map(n => parseInt(n, 10));
  return new Date(year, month - 1, day);
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) return { valid: true }; // Optional field
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.length < 10) {
    return { valid: false, error: "Phone number must be at least 10 digits" };
  }
  
  if (cleaned.length > 15) {
    return { valid: false, error: "Phone number must be less than 15 digits" };
  }
  
  return { valid: true };
};
