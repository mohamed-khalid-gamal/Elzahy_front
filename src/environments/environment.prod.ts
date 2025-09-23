import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiBaseUrl: 'https://elzahytest.runasp.net/api',
  enableDevTools: false,
  logLevel: 'error' as const,

  // API Endpoints (same structure as development)
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      refreshToken: '/auth/refresh-token',
      me: '/auth/me',
      updateProfile: '/auth/me',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      confirmEmail: '/auth/confirm-email',
      twoFactor: {
        setup: '/auth/2fa/setup',
        enable: '/auth/2fa/enable',
        disable: '/auth/2fa/disable',
        verify: '/auth/2fa/verify',
        verifyRecovery: '/auth/2fa/verify-recovery',
        recoveryCodes: '/auth/2fa/recovery-codes'
      }
    },
    projects: {
      base: '/projects',
      byStatus: '/projects/status'
    },
    awards: {
      base: '/awards'
    },
    contact: {
      base: '/contact',
      markRead: '/contact/{id}/mark-read',
      markReplied: '/contact/{id}/mark-replied'
    },
    health: '/health'
  },

  // Authentication Settings
  auth: {
    tokenStorageKey: 'accessToken',
    refreshTokenStorageKey: 'refreshToken',
    userStorageKey: 'user',
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    maxRetryAttempts: 3
  },

  // Application Settings
  app: {
    name: 'Elzahy Portfolio',
    version: '1.0.0',
    supportEmail: 'support@elzahy.com',
    defaultLanguage: 'en',
    itemsPerPage: 10,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: ['application/pdf']
  },

  // Feature Flags (Production configuration)
  features: {
    enableRegistration: false, // Typically disabled in production
    enableTwoFactor: true,
    enableContactForm: true,
    enableProjectSubmission: false,
    enableDarkMode: true,
    enableNotifications: true,
    enableAnalytics: true // Enable analytics in production
  },

  // External Services (Production URLs)
  external: {
    swaggerUrl: '', // Swagger disabled in production
    healthCheckUrl: 'https://elzahytest.runasp.net/api/health'
  },

  // UI Configuration
  ui: {
    defaultTheme: 'light',
    animationDuration: 300,
    toastDuration: 5000,
    loadingDebounce: 500,
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 25, 50]
    }
  },

  // Validation Rules (matching API requirements)
  validation: {
    password: {
      minLength: 6,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    project: {
      nameMaxLength: 200,
      descriptionMaxLength: 2000
    },
    award: {
      nameMaxLength: 200,
      givenByMaxLength: 200
    },
    contact: {
      fullNameMaxLength: 100,
      emailMaxLength: 255,
      subjectMaxLength: 200,
      messageMaxLength: 5000
    },
    user: {
      nameMaxLength: 100
    }
  },

  // Error Codes (matching API error codes)
  errorCodes: {
    VALIDATION_ERROR: 1001,
    AUTHENTICATION_FAILED: 1002,
    AUTHORIZATION_FAILED: 1003,
    RESOURCE_NOT_FOUND: 1004,
    DUPLICATE_RESOURCE: 1005,
    TWO_FACTOR_REQUIRED: 1006,
    INVALID_TWO_FACTOR_CODE: 1007,
    EMAIL_NOT_CONFIRMED: 1008,
    TOKEN_EXPIRED: 1009,
    INVALID_TOKEN: 1010
  }
};
