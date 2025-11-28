
import { Coordinates } from "./types";

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
};

export const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  if (password.length < 8) return 'medium';
  
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (hasNumber && hasSpecial) return 'strong';
  if (hasNumber || hasSpecial) return 'medium';
  return 'weak';
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  
  if (numbers.length > 10) {
    // (11) 91234-5678
    return numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (numbers.length > 6) {
    // (11) 1234-5678 (Fixed line or partial mobile)
    return numbers.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (numbers.length > 2) {
    return numbers.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
  } else {
    return numbers.replace(/^(\d*)/, '($1');
  }
};

export const validateCNPJ = (cnpj: string): boolean => {
  const clean = cnpj.replace(/[^\d]/g, '');

  if (clean.length !== 14) return false;
  // Eliminate known invalid CNPJs (e.g., 00000000000000)
  if (/^(\d)\1+$/.test(clean)) return false;

  // Algorithm to validate digits
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

export const formatCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

export const validateTaxID = (value: string): boolean => {
  // Generic validation for international IDs (at least 5 chars)
  return value.trim().length >= 5;
};

export const mockGeocode = async (query: string): Promise<Coordinates | null> => {
    // Simulating an API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const q = query.toLowerCase().trim();

    // Mock Database of Brazilian Cities/Areas
    if (q.includes('são paulo') || q.includes('sao paulo') || q.includes('sp')) return { lat: -23.5505, lng: -46.6333 };
    if (q.includes('rio') || q.includes('rj')) return { lat: -22.9068, lng: -43.1729 };
    if (q.includes('belo horizonte') || q.includes('mg')) return { lat: -19.9167, lng: -43.9345 };
    if (q.includes('curitiba') || q.includes('pr')) return { lat: -25.4244, lng: -49.2654 };
    if (q.includes('brasilia') || q.includes('brasília') || q.includes('df')) return { lat: -15.7975, lng: -47.8919 };
    if (q.includes('salvador') || q.includes('ba')) return { lat: -12.9777, lng: -38.5016 };
    
    // Mock CEP (Zip Code) validation - returns a fixed point for demo if it looks like a CEP
    if (/^\d{5}-?\d{3}$/.test(q)) {
        // Return a slightly randomized point near São Paulo center to simulate neighborhood precision
        return { lat: -23.5505 + (Math.random() * 0.02 - 0.01), lng: -46.6333 + (Math.random() * 0.02 - 0.01) };
    }

    return null;
};

export const mockReverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Mock function to simulate "Reverse Geocoding" (Lat/Lng -> "City, State")
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple boundary checks for demo purposes
    if (lat > -24 && lat < -23 && lng > -47 && lng < -46) return "São Paulo, SP";
    if (lat > -23.5 && lat < -22 && lng > -44 && lng < -42) return "Rio de Janeiro, RJ";
    if (lat > -20 && lat < -19 && lng > -45 && lng < -43) return "Belo Horizonte, MG";
    
    // Fallback based on typical user locations in Brazil for demo
    return "São Paulo, SP";
};

const LOCATION_STORAGE_KEY = 'anymais_user_location_name';

export const saveLocationToStorage = (locationName: string) => {
    localStorage.setItem(LOCATION_STORAGE_KEY, locationName);
};

export const getLocationFromStorage = (): string | null => {
    return localStorage.getItem(LOCATION_STORAGE_KEY);
};
