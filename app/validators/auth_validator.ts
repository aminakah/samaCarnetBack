// import Tenant from '#models/tenant' // Unused import
import vine from '@vinejs/vine'

/**
 * Login validator
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6),
    tenantId: vine.number().optional()
  })
)

/**
 * Register validator
 */
export const registerValidator = vine.compile(
  vine.object({
    firstName: vine.string().minLength(2).maxLength(50).trim(),
    lastName: vine.string().minLength(2).maxLength(50).trim(),
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8),
    role: vine.enum(['admin', 'doctor', 'midwife', 'patient']).optional(),
    phone: vine.string().optional(),
    dateOfBirth: vine.string().optional(), // Will be converted to DateTime later
    gender: vine.enum(['male', 'female', 'other']).optional(),
    address: vine.string().optional(),
    preferredLanguage: vine.enum(['fr', 'wo', 'en']).optional(),
    
    // For tenant registration
    organizationName: vine.string().optional(),
    subdomain: vine.string().optional()
  })
)

/**
 * Change password validator
 */
export const changePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    newPassword: vine.string().minLength(8),
    confirmPassword: vine.string()
  })
)

/**
 * Update profile validator
 */
export const updateProfileValidator = vine.compile(
  vine.object({
    firstName: vine.string().minLength(2).maxLength(50).trim().optional(),
    lastName: vine.string().minLength(2).maxLength(50).trim().optional(),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    preferredLanguage: vine.enum(['fr', 'wo', 'en']).optional(),
    emergencyContactName: vine.string().optional(),
    emergencyContactPhone: vine.string().optional()
  })
)

/**
 * Sync token validator
 */
export const syncTokenValidator = vine.compile(
  vine.object({
    syncToken: vine.string().uuid(),
    lastSync: vine.string().optional() // ISO timestamp
  })
)
