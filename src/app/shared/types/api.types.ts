// API Response wrapper
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: ErrorDetails;
}

export interface ErrorDetails {
  message: string;
  internalCode?: number;
}

// Pagination Types
export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Authentication Types
export interface LoginRequestDto {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  name: string;
  terms: boolean;
}

export interface UserDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
  language: string;
  role: string; // "Admin" | "User"
  twoFactorEnabled: boolean;
  emailConfirmed: boolean;
  failedLoginAttempts?: number;
  lockoutEnd?: string | null;
  lastLoginAt?: string | null;
  isLockedOut?: boolean;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto | null;
  requiresTwoFactor: boolean;
  tempToken: string | null;
  expiresIn: number;
}

export interface TokenRefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface LogoutRequestDto {
  refreshToken: string;
}

export interface UpdateProfileRequestDto {
  name?: string;
  language?: string;
}

// 2FA Types
export interface Setup2FAResponseDto {
  secretKey: string;
  qrCodeImage: string; // Base64 encoded PNG
  manualEntryKey: string; // Formatted for manual entry
}

export interface Enable2FARequestDto {
  code: string;
}

export interface Enable2FAResponseDto {
  success: boolean;
  recoveryCodes: string[];
  message: string;
}

export interface TwoFactorVerifyRequestDto {
  tempToken: string;
  code: string;
}

export interface RecoveryCodeVerifyRequestDto {
  tempToken: string;
  recoveryCode: string;
}

export interface RecoveryCodesResponseDto {
  recoveryCodes: string[];
  count: number;
  generatedAt: string;
}

// Password Reset Types
export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

// Password Management Types
export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

// Admin Role Request Types
export interface AdminRoleRequestDto {
  reason: string;
  additionalInfo?: string;
}

export interface AdminRoleRequestResponseDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  additionalInfo?: string;
  isProcessed: boolean;
  isApproved?: boolean;
  adminNotes?: string;
  processedAt?: string;
  processedByUserId?: string;
  processedByUserName?: string;
  createdAt: string;
}

export interface ProcessAdminRequestDto {
  approved: boolean;
  adminNotes?: string;
}

// User Management Types (Admin Only)
export interface CreateUserRequestDto {
  email: string;
  password: string;
  name: string;
  role: string; // "User" | "Admin"
}

export interface AdminUserDto extends UserDto {
  hasPendingAdminRequest: boolean;
}

// Enhanced Registration with Admin Request
export interface EnhancedRegisterRequestDto extends RegisterRequestDto {
  requestAdminRole?: boolean;
  adminRequestReason?: string;
  adminRequestAdditionalInfo?: string;
}

// Project Types
export enum ProjectStatus {
  Current = 0,
  Future = 1,
  Past = 2
}

// Project Image DTOs
export interface ProjectImageDto {
  id: string;
  imageData: string; // Base64 encoded image data
  contentType: string; // MIME type like "image/jpeg"
  fileName: string; // Original filename
  description?: string;
  isMainImage: boolean;
  sortOrder: number;
}

// Add single image to existing project
export interface AddProjectImageRequestDto {
  image: File;
  description?: string;
  isMainImage?: boolean;
}

export interface ProjectDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  photoUrl?: string; // Deprecated: kept for backward compatibility
  imageData?: string; // Deprecated: kept for backward compatibility
  imageContentType?: string; // Deprecated: kept for backward compatibility
  imageFileName?: string; // Deprecated: kept for backward compatibility
  images: ProjectImageDto[]; // New: Multiple images support
  mainImage?: ProjectImageDto; // New: Quick access to main image
  status: ProjectStatus;
  technologiesUsed?: string;
  projectUrl?: string;
  gitHubUrl?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  budget?: number;
  isPublished: boolean;
  sortOrder: number;
  createdByName?: string;
}

// API Response ProjectDto - represents what actually comes from the API
export interface ApiProjectDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  photoUrl?: string; // Deprecated: kept for backward compatibility
  imageData?: string; // Deprecated: kept for backward compatibility
  imageContentType?: string; // Deprecated: kept for backward compatibility
  imageFileName?: string; // Deprecated: kept for backward compatibility
  images: ProjectImageDto[]; // New: Multiple images support
  mainImage?: ProjectImageDto; // New: Quick access to main image
  status: string; // API returns status as string
  technologiesUsed?: string;
  projectUrl?: string;
  gitHubUrl?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  budget?: number;
  isPublished: boolean;
  sortOrder: number;
  createdByName?: string;
}

export interface CreateProjectRequestDto {
  name: string; // Required, max 200 chars
  description: string; // Required
  photoUrl?: string; // Deprecated: kept for backward compatibility
  status: ProjectStatus; // Required
  technologiesUsed?: string;
  projectUrl?: string;
  gitHubUrl?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  budget?: number;
  isPublished?: boolean; // Default: true
  sortOrder?: number; // Default: 0
}

// Form data request for creating projects with file upload
export interface CreateProjectFormRequestDto {
  name: string;
  description: string;
  status: ProjectStatus;
  images?: File[]; // Multiple image file uploads
  mainImageIndex?: number; // Index of main image in the images array
  technologiesUsed?: string;
  projectUrl?: string;
  gitHubUrl?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  budget?: number;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface UpdateProjectRequestDto {
  name?: string;
  description?: string;
  photoUrl?: string; // Deprecated: kept for backward compatibility
  status?: ProjectStatus;
  technologiesUsed?: string;
  projectUrl?: string;
  gitHubUrl?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  budget?: number;
  isPublished?: boolean;
  sortOrder?: number;
}

// Form data request for updating projects with file upload
export interface UpdateProjectFormRequestDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  newImages?: File[]; // New images to add
  removeImageIds?: string[]; // IDs of images to remove
  mainImageId?: string; // ID of image to set as main
  technologiesUsed?: string;
  projectUrl?: string;
  gitHubUrl?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
  budget?: number;
  isPublished?: boolean;
  sortOrder?: number;
}

// Award Types
export interface AwardDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  givenBy: string;
  dateReceived: string;
  description?: string;
  certificateUrl?: string;
  imageUrl?: string; // Deprecated: kept for backward compatibility
  imageData?: string; // Base64 encoded image data
  imageContentType?: string; // MIME type like "image/jpeg"
  imageFileName?: string; // Original filename
  isPublished: boolean;
  sortOrder: number;
  createdByName?: string;
}

export interface CreateAwardFormRequestDto {
  name: string; // Required, max 200 chars
  givenBy: string; // Required, max 200 chars
  dateReceived: string; // Required, ISO date
  description?: string;
  certificateUrl?: string;
  image?: File; // Image file upload
  isPublished?: boolean; // Default: true
  sortOrder?: number; // Default: 0
}

export interface UpdateAwardFormRequestDto {
  name?: string;
  givenBy?: string;
  dateReceived?: string;
  description?: string;
  certificateUrl?: string;
  image?: File; // Image file upload
  removeImage?: boolean; // Flag to remove existing image
  isPublished?: boolean;
  sortOrder?: number;
}

// Contact Types
export interface ContactMessageDto {
  id: string;
  createdAt: string;
  fullName: string;
  emailAddress: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  readAt?: string;
  repliedAt?: string;
  phoneNumber?: string;
  company?: string;
  adminNotes?: string;
}

export interface CreateContactMessageRequestDto {
  fullName: string; // Required, max 100 chars
  emailAddress: string; // Required, valid email, max 255 chars
  subject: string; // Required, max 200 chars
  message: string; // Required
  phoneNumber?: string;
  company?: string;
}

export interface UpdateContactMessageRequestDto {
  isRead?: boolean;
  isReplied?: boolean;
  adminNotes?: string;
}

export interface ContactMessageFilterDto {
  fromDate?: string;
  toDate?: string;
  isRead?: boolean;
  isReplied?: boolean;
  sortBy?: "CreatedAt" | "Subject" | "FullName";
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}

// Health Check Types
export interface HealthCheckResponse {
  status: string;
  environment: string;
  timestamp: string;
}

// Common Filter Types
export interface ProjectFilterParams {
  status?: ProjectStatus;
  isPublished?: boolean;
}

export interface AwardFilterParams {
  isPublished?: boolean;
}

// Token Types (for internal use)
export interface TokenPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
}

// Error Response Types (matching API error codes)
export interface ApiError {
  message: string;
  internalCode: number;
  details?: any;
}

export const ErrorCodes = {
  VALIDATION_ERROR: 1001,
  AUTHENTICATION_FAILED: 1002,
  AUTHORIZATION_FAILED: 1003,
  RESOURCE_NOT_FOUND: 1004,
  DUPLICATE_RESOURCE: 1005,
  TWO_FACTOR_REQUIRED: 1006,
  INVALID_TWO_FACTOR_CODE: 1007,
  EMAIL_NOT_CONFIRMED: 1008,
  TOKEN_EXPIRED: 1009,
  INVALID_TOKEN: 1010,
  ACCOUNT_LOCKED: 1011,
  TOO_MANY_ATTEMPTS: 1012
} as const;

// Type guards for better type safety
export function isApiError(error: any): error is ApiError {
  return error && typeof error.message === 'string' && typeof error.internalCode === 'number';
}

export function isAuthResponse(response: any): response is AuthResponseDto {
  return response &&
         typeof response.accessToken === 'string' &&
         typeof response.refreshToken === 'string' &&
         typeof response.expiresIn === 'number';
}

export function isUserDto(user: any): user is UserDto {
  return user &&
         typeof user.id === 'string' &&
         typeof user.email === 'string' &&
         typeof user.name === 'string' &&
         typeof user.role === 'string';
}

// Utility types for form validation
export type RequiredFields<T> = {
  [K in keyof T]-?: T[K];
};

export type OptionalFields<T> = {
  [K in keyof T]?: T[K];
};

// HTTP Status Codes
export const HttpStatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Type aliases for backward compatibility (without Dto suffix)
// Pagination type alias for backward compatibility
export type LoginRequest = LoginRequestDto;
export type RegisterRequest = RegisterRequestDto;
export type User = UserDto;
export type AuthResponse = AuthResponseDto;
export type TokenRefreshResponse = TokenRefreshResponseDto;
export type RefreshTokenRequest = RefreshTokenRequestDto;
export type LogoutRequest = LogoutRequestDto;
export type UpdateProfileRequest = UpdateProfileRequestDto;

// 2FA Type aliases
export type TwoFactorSetupResponse = Setup2FAResponseDto;
export type TwoFactorEnableResponse = Enable2FAResponseDto;
export type TwoFactorVerifyRequest = TwoFactorVerifyRequestDto;
export type RecoveryCodeVerifyRequest = RecoveryCodeVerifyRequestDto;
export type RecoveryCodesResponse = RecoveryCodesResponseDto;

// Password Reset Type aliases
export type ForgotPasswordRequest = ForgotPasswordRequestDto;
export type ResetPasswordRequest = ResetPasswordRequestDto;

// Project Type aliases
export type Project = ProjectDto;
export type CreateProjectRequest = CreateProjectRequestDto;
export type UpdateProjectRequest = UpdateProjectRequestDto;

// Award Type aliases
export type Award = AwardDto;
export type CreateAwardRequest = CreateAwardFormRequestDto;
export type UpdateAwardRequest = UpdateAwardFormRequestDto;

// Contact Type aliases
export type ContactMessage = ContactMessageDto;
export type CreateContactRequest = CreateContactMessageRequestDto;
export type UpdateContactRequest = UpdateContactMessageRequestDto;
export type ContactMessageFilter = ContactMessageFilterDto;

// Enhanced authentication type aliases
export type ChangePasswordRequest = ChangePasswordRequestDto;
export type AdminRoleRequest = AdminRoleRequestDto;
export type AdminRoleRequestResponse = AdminRoleRequestResponseDto;
export type ProcessAdminRequest = ProcessAdminRequestDto;
export type CreateUserRequest = CreateUserRequestDto;
export type AdminUser = AdminUserDto;
export type EnhancedRegisterRequest = EnhancedRegisterRequestDto;

// Form Models for UI Components
export interface LoginFormModel {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormModel {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  terms: boolean;
  requestAdminRole?: boolean;
  adminRequestReason?: string;
  adminRequestAdditionalInfo?: string;
}

export interface ChangePasswordFormModel {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordFormModel {
  email: string;
}

export interface ResetPasswordFormModel {
  newPassword: string;
  confirmNewPassword: string;
}

export interface TwoFactorFormModel {
  code: string;
}

export interface AdminRequestFormModel {
  reason: string;
  additionalInfo?: string;
}

export interface CreateUserFormModel {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: string;
}

export interface ProcessAdminRequestFormModel {
  approved: boolean;
  adminNotes?: string;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Dashboard Types
export interface AdminDashboardStats {
  totalUsers: number;
  totalAdmins: number;
  pendingAdminRequests: number;
  totalProjects: number;
  totalAwards: number;
  totalContactMessages: number;
  unreadContactMessages: number;
  recentRegistrations: number;
}

// User Status Types
export interface UserStatus {
  isActive: boolean;
  isEmailConfirmed: boolean;
  isTwoFactorEnabled: boolean;
  isLocked: boolean;
  lockoutEnd?: string;
  lastLoginAt?: string;
  failedLoginAttempts: number;
}
