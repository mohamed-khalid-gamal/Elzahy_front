export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  enableDevTools: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  endpoints: {
    auth: {
      register: string;
      login: string;
      logout: string;
      refreshToken: string;
      me: string;
      updateProfile: string;
      forgotPassword: string;
      resetPassword: string;
      confirmEmail: string;
      twoFactor: {
        setup: string;
        enable: string;
        disable: string;
        verify: string;
        verifyRecovery: string;
        recoveryCodes: string;
      };
    };
    projects: {
      base: string;
      byStatus: string;
    };
    awards: {
      base: string;
    };
    contact: {
      base: string;
      markRead: string;
      markReplied: string;
    };
    health: string;
  };

  auth: {
    tokenStorageKey: string;
    refreshTokenStorageKey: string;
    userStorageKey: string;
    tokenRefreshThreshold: number;
    maxRetryAttempts: number;
  };

  app: {
    name: string;
    version: string;
    supportEmail: string;
    defaultLanguage: string;
    itemsPerPage: number;
    maxFileSize: number;
    allowedImageTypes: string[];
    allowedDocumentTypes: string[];
  };

  features: {
    enableRegistration: boolean;
    enableTwoFactor: boolean;
    enableContactForm: boolean;
    enableProjectSubmission: boolean;
    enableDarkMode: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };

  external: {
    swaggerUrl: string;
    healthCheckUrl: string;
  };

  ui: {
    defaultTheme: string;
    animationDuration: number;
    toastDuration: number;
    loadingDebounce: number;
    pagination: {
      defaultPageSize: number;
      pageSizeOptions: number[];
    };
  };

  validation: {
    password: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    project: {
      nameMaxLength: number;
      descriptionMaxLength: number;
    };
    award: {
      nameMaxLength: number;
      givenByMaxLength: number;
    };
    contact: {
      fullNameMaxLength: number;
      emailMaxLength: number;
      subjectMaxLength: number;
      messageMaxLength: number;
    };
    user: {
      nameMaxLength: number;
    };
  };

  errorCodes: {
    VALIDATION_ERROR: number;
    AUTHENTICATION_FAILED: number;
    AUTHORIZATION_FAILED: number;
    RESOURCE_NOT_FOUND: number;
    DUPLICATE_RESOURCE: number;
    TWO_FACTOR_REQUIRED: number;
    INVALID_TWO_FACTOR_CODE: number;
    EMAIL_NOT_CONFIRMED: number;
    TOKEN_EXPIRED: number;
    INVALID_TOKEN: number;
  };
}
