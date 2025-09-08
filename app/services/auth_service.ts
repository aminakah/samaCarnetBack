import User from '#models/user'
import Tenant from '#models/tenant'
import Role from '#models/role'
import UserRole from '#models/user_role'
import hash from '@adonisjs/core/services/hash'
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
    password: string
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const user = await User.query()
        .where('email', email)
        .where('status', 'active')
        .whereNull('deleted_at')
        .preload('tenant')
        .preload('userRoles')
        .preload('userPermissions')
        .first()
      
      if (!user) {
        return { success: false, message: 'Invalid credentials' }
      }
      
      const isValidPassword = await hash.verify(user.password, password)
      if (!isValidPassword) {
        return { success: false, message: 'Invalid credentials' }
      }

      // // Check tenant is active
      // if (!user.tenant.isActive) {
      //   return { success: false, message: 'Tenant subscription expired or inactive' }
      // }

      return { success: true, user }
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
    roleName?: string
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
      // Role will be assigned after user creation
      user.phone = data.phone ?? null
      user.dateOfBirth = data.dateOfBirth ?? null
      user.gender = data.gender as any
      user.address = data.address ?? null
      user.preferredLanguage = data.preferredLanguage || 'fr'
      user.status = 'active'

      await user.save()

      // Assign role to user
      if (data.roleName) {
        const role = await Role.findBy('name', data.roleName)
        if (role) {
          await UserRole.create({
            userId: user.id,
            roleId: role.id,
            tenantId: user.tenantId,
            assignedAt: DateTime.now(),
            isActive: true
          })
        }
      }

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
  static async canAccessPatientData(user: User, patientId: number): Promise<boolean> {
    // Admin can access all
    if (await user.isAdmin()) return true
    
    // Medical staff can access assigned patients (simplified for now)
    if (await user.isMedicalStaff()) return true
    
    // Patients can only access their own data
    if (await user.isPatient()) return user.id === patientId
    
    return false
  }

  /**
   * Check if user has medical staff permissions
   */
  static async isMedicalStaff(user: User): Promise<boolean> {
    return await user.isMedicalStaff()
  }

  /**
   * Get users by role in tenant
   */
  static async getUsersByRole(tenantId: number, roleName: string): Promise<User[]> {
    return await User.findByRoleInTenant(tenantId, roleName)
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
      roleName: 'admin',
      phone: adminData.phone
    })
  }
}
