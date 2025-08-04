// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy HH:mm'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate random ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Parse error message from API response
 */
export function parseErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error?.response?.data?.message) {
    if (Array.isArray(error.response.data.message)) {
      return error.response.data.message.join(', ');
    }
    return error.response.data.message;
  }
  
  if (error?.message) return error.message;
  
  return 'An unexpected error occurred';
}

/**
 * Check if string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

/**
 * Get device status color
 */
export function getDeviceStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'online':
      return 'text-green-600 bg-green-100';
    case 'offline':
      return 'text-red-600 bg-red-100';
    case 'error':
      return 'text-yellow-600 bg-yellow-100';
    case 'maintenance':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get object type color
 */
export function getObjectTypeColor(objectType: string): string {
  const colors = {
    person: '#3B82F6',
    vehicle: '#10B981',
    bicycle: '#F59E0B',
    dog: '#EF4444',
    cat: '#8B5CF6',
    bird: '#06B6D4',
  };
  
  return colors[objectType as keyof typeof colors] || '#6B7280';
}

/**
 * Generate mock event data for testing
 */
export function generateMockEvent(deviceId: string) {
  const objectTypes = ['person', 'vehicle', 'bicycle', 'dog', 'cat'];
  const eventTypes = ['detection', 'entry', 'exit', 'count_update'];
  
  return {
    id: generateId(),
    deviceId,
    objectType: objectTypes[Math.floor(Math.random() * objectTypes.length)],
    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    confidence: Math.random() * 0.4 + 0.6,
    count: Math.floor(Math.random() * 5) + 1,
    boundingBox: {
      x: Math.floor(Math.random() * 1920),
      y: Math.floor(Math.random() * 1080),
      width: Math.floor(Math.random() * 200) + 50,
      height: Math.floor(Math.random() * 300) + 100,
    },
    metadata: {
      processingTime: Math.floor(Math.random() * 100) + 10,
      temperature: Math.floor(Math.random() * 20) + 60,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Local storage utilities with error handling
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};