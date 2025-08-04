// src/lib/constants.ts
export const APP_CONFIG = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Edge AI Tracker',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Real-time Edge-AI Object Tracking & Analytics',
    author: 'Edge AI Team',
  } as const;
  
  export const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    timeout: 30000,
    retries: 3,
  } as const;
  
  export const UI_CONFIG = {
    theme: (process.env.NEXT_PUBLIC_THEME as 'light' | 'dark') || 'light',
    sidebarCollapsed: process.env.NEXT_PUBLIC_SIDEBAR_COLLAPSED === 'true',
    chartTheme: process.env.NEXT_PUBLIC_CHART_THEME || 'blue',
    pageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '20'),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100'),
  } as const;
  
  export const FEATURE_FLAGS = {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    realTime: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
    deviceManagement: process.env.NEXT_PUBLIC_ENABLE_DEVICE_MANAGEMENT === 'true',
    userProfiles: process.env.NEXT_PUBLIC_ENABLE_USER_PROFILES === 'true',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    mockData: process.env.NEXT_PUBLIC_MOCK_DATA === 'true',
  } as const;
  
  export const CHART_CONFIG = {
    refreshInterval: parseInt(process.env.NEXT_PUBLIC_CHART_REFRESH_INTERVAL || '5000'),
    eventFetchLimit: parseInt(process.env.NEXT_PUBLIC_EVENT_FETCH_LIMIT || '100'),
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      danger: '#EF4444',
      warning: '#F59E0B',
      info: '#06B6D4',
      success: '#10B981',
    },
    objectTypeColors: {
      person: '#3B82F6',
      vehicle: '#10B981',
      bicycle: '#F59E0B',
      dog: '#EF4444',
      cat: '#8B5CF6',
      bird: '#06B6D4',
      default: '#6B7280',
    },
  } as const;
  
  export const WEBSOCKET_CONFIG = {
    reconnectAttempts: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_ATTEMPTS || '5'),
    reconnectDelay: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_DELAY || '3000'),
    timeout: 10000,
  } as const;
  
  export const DEVICE_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    ERROR: 'error',
    MAINTENANCE: 'maintenance',
  } as const;
  
  export const EVENT_TYPES = {
    DETECTION: 'detection',
    ENTRY: 'entry',
    EXIT: 'exit',
    COUNT_UPDATE: 'count_update',
  } as const;
  
  export const OBJECT_TYPES = {
    PERSON: 'person',
    VEHICLE: 'vehicle',
    BICYCLE: 'bicycle',
    DOG: 'dog',
    CAT: 'cat',
    BIRD: 'bird',
  } as const;
  
  export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    VIEWER: 'viewer',
  } as const;
  
  export const LOCAL_STORAGE_KEYS = {
    AUTH_TOKEN: 'edge_ai_token',
    USER_PREFERENCES: 'edge_ai_preferences',
    THEME: 'edge_ai_theme',
    SIDEBAR_STATE: 'edge_ai_sidebar',
  } as const;
  
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    EVENTS: '/events',
    DEVICES: '/devices',
    PROFILE: '/profile',
    ANALYTICS: '/analytics',
  } as const;
  
  export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      REFRESH: '/auth/refresh',
    },
    DEVICES: {
      LIST: '/devices',
      CREATE: '/devices',
      UPDATE: (id: string) => `/devices/${id}`,
      DELETE: (id: string) => `/devices/${id}`,
      STATUS: (deviceId: string) => `/devices/device/${deviceId}/status`,
    },
    EVENTS: {
      LIST: '/events',
      CREATE: '/events',
      GET: (id: string) => `/events/${id}`,
      COUNTS: '/events/counts',
    },
    ANALYTICS: {
      DASHBOARD: '/analytics/dashboard',
      HOURLY: '/analytics/hourly',
      DEVICE: (deviceId: string) => `/analytics/device/${deviceId}`,
      TRENDS: '/analytics/trends',
    },
  } as const;
  
  export const VALIDATION_RULES = {
    EMAIL: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    },
    PASSWORD: {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters',
      },
    },
    DEVICE_ID: {
      required: 'Device ID is required',
      minLength: {
        value: 3,
        message: 'Device ID must be at least 3 characters',
      },
      maxLength: {
        value: 50,
        message: 'Device ID must not exceed 50 characters',
      },
    },
    DEVICE_NAME: {
      required: 'Device name is required',
      minLength: {
        value: 2,
        message: 'Device name must be at least 2 characters',
      },
      maxLength: {
        value: 100,
        message: 'Device name must not exceed 100 characters',
      },
    },
  } as const;
  
  
  
  