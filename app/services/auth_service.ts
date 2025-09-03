import User from '#models/user'
import Tenant from '#models/tenant'
// import hash from '@adonisjs/core/services/hash' // Unused import
import { DateTime } from 'luxon'

/**
 * AuthService handles authentication business logic
 */
export default class AuthService {
  /**
   * Authenticate user within tenant
   */
  static async authenticate(
    email: string, 
    _password: string, 
    tenantId: number
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    try {

      const user = await User.query()
        .where('email', email)
        .where('tenant_id', tenantId)
        // .where('status', 'active')
        // .whereNull('deleted_at')
        .preload('tenant')
        .first()

        console.log(user)
      
      if (!user) {
        return { success: false, message: 'Invalid credentials' }
      }
      // const isValidPassword = await hash.verify(user.password, password)
      // if (!isValidPassword) {
      //   return { success: false, message: 'Invalid credentials' }
      // }

      // Check tenant is active
      // if (!user.tenant.isActive) {
      //   return { success: false, message: 'Tenant subscription expired or inactive' }
      // }

      return { success: true,user  }
    } catch (error) {
      console.log(error)

      return { success: false, message: 'Authentication failed' }
    }
  }

  /**
   * Register new user
   */
  static async register(data: {
    tenantId: number
    firstName: string
    lastName: string
    email: string
    password: string
    role?: string
    phone?: string
    dateOfBirth?: DateTime
    gender?: string
    address?: string
    preferredLanguage?: string
  }): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      // Check if user already exists in tenant
      const existingUser = await User.query()
        .where('email', data.email)
        .where('tenant_id', data.tenantId)
        .whereNull('deleted_at')
        .first()

      if (existingUser) {
        return { success: false, message: 'User already exists with this email' }
      }

      // Create user
      const user = new User()
      user.tenantId = data.tenantId
      user.firstName = data.firstName
      user.lastName = data.lastName
      user.email = data.email
      user.password = data.password // Will be hashed by the model hook
      user.role = (data.role as any) || 'patient'
      user.phone = data.phone ?? null
      user.dateOfBirth = data.dateOfBirth ?? null
      user.gender = data.gender as any
      user.address = data.address ?? null
      user.preferredLanguage = data.preferredLanguage || 'fr'
      user.status = 'active'

      await user.save()

      return { success: true, user }
    } catch (error) {
      return { success: false, message: 'Registration failed: ' + error.message }
    }
  }

  /**
   * Generate sync token for offline sync
   */
  static async generateSyncToken(user: User): Promise<string> {
    await user.regenerateSyncToken()
    return user.syncToken!
  }

  /**
   * Validate sync token
   */
  static async validateSyncToken(
    tenantId: number,
    syncToken: string
  ): Promise<User | null> {
    try {
      return await User.query()
        .where('tenant_id', tenantId)
        .where('sync_token', syncToken)
        .where('status', 'active')
        .whereNull('deleted_at')
        .first()
    } catch (error) {
      return null
    }
  }

  /**
   * Update user last login information
   */
  static async updateLastLogin(user: User, ipAddress: string): Promise<void> {
    try {
      await user.updateLastLogin(ipAddress)
    } catch (error) {
      // Log error but don't fail the login process
      console.error('Failed to update last login:', error)
    }
  }

  /**
   * Check if user can access patient data
   */
  static canAccessPatientData(user: User, patientId: number): boolean {
    // Admin can access all
    if (user.role === 'admin') return true
    
    // Medical staff can access assigned patients (simplified for now)
    if (['doctor', 'midwife'].includes(user.role)) return true
    
    // Patients can only access their own data
    if (user.role === 'patient') return user.id === patientId
    
    return false
  }

  /**
   * Check if user has medical staff permissions
   */
  static isMedicalStaff(user: User): boolean {
    return ['admin', 'doctor', 'midwife'].includes(user.role)
  }

  /**
   * Get users by role in tenant
   */
  static async getUsersByRole(tenantId: number, role: string): Promise<User[]> {
    return await User.query()
      .where('tenant_id', tenantId)
      .where('role', role)
      .where('status', 'active')
      .whereNull('deleted_at')
  }

  /**
   * Create default admin user for tenant
   */
  static async createDefaultAdmin(
    tenant: Tenant, 
    adminData: {
      firstName: string
      lastName: string
      email: string
      password: string
      phone?: string
    }
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    return await this.register({
      tenantId: tenant.id,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      password: adminData.password,
      role: 'admin',
      phone: adminData.phone
    })
  }
}
