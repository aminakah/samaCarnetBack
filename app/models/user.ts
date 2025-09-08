import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { v4 as uuidv4 } from 'uuid'
import Tenant from './tenant.js'
import VaccineSchedule from './vaccine_schedule.js'
import Role from './role.js'
import UserRole from './user_role.js'
import UserPermission from './user_permission.js'

/**
 * User model supporting multiple roles within a tenant
 * Includes patient and medical staff information
 */
export default class User extends BaseModel {
  static accessTokens = DbAccessTokensProvider.forModel(User)

  @column({ isPrimary: true })
  declare id: number

  // Tenant relationship (optional for patients)
  @column()
  declare tenantId: number | null

  // Basic information
  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column.date()
  declare dateOfBirth: DateTime | null

  @column()
  declare gender: 'male' | 'female' | 'other' | null

  // Authentication
  @column({ serializeAs: null })
  declare password: string

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column()
  declare rememberMeToken: string | null





  // Professional information (for medical staff)
  @column()
  declare licenseNumber: string | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare specialties: string[] | null

  @column()
  declare bio: string | null

  // Patient specific information
  @column()
  declare emergencyContactName: string | null

  @column()
  declare emergencyContactPhone: string | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare medicalHistory: Record<string, any> | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare allergies: string[] | null

  // Profile and preferences
  @column()
  declare address: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare preferredLanguage: string

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare notificationPreferences: Record<string, any> | null

  // Status and tracking
  @column()
  declare status: 'active' | 'inactive' | 'suspended'

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column()
  declare lastLoginIp: string | null

  // Sync and offline support
  @column()
  declare syncToken: string | null

  @column.dateTime()
  declare lastSyncAt: DateTime | null

  @column()
  declare version: number

  // Timestamps
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @belongsTo(() => Tenant, {
    foreignKey: 'tenantId'
  })
  declare tenant: BelongsTo<typeof Tenant>

  @hasMany(() => VaccineSchedule, {
    foreignKey: 'patientId',
  })
  declare vaccineSchedules: HasMany<typeof VaccineSchedule>

  @hasMany(() => UserRole, {
    foreignKey: 'userId'
  })
  declare userRoles: HasMany<typeof UserRole>

  @hasMany(() => UserPermission, {
    foreignKey: 'userId'
  })
  declare userPermissions: HasMany<typeof UserPermission>

  @hasMany(() => VaccineSchedule, {
    foreignKey: 'assignedProviderId',
  })
  declare assignedVaccineSchedules: HasMany<typeof VaccineSchedule>

  // Hooks
  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @beforeSave()
  static async generateSyncToken(user: User) {
    if (user.$isNew || !user.syncToken) {
      user.syncToken = uuidv4()
    }
  }

  @beforeSave()
  static async incrementVersion(user: User) {
    if (!user.$isNew && Object.keys(user.$dirty).length > 0) {
      user.version = (user.version || 1) + 1
      user.lastSyncAt = DateTime.now()
    }
  }

  /**
   * Get full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  /**
   * Check if user is medical staff
   */
  async isMedicalStaff(): Promise<boolean> {
    const roles = await this.getActiveRoles()
    return roles.some(role => role.isMedical)
  }

  /**
   * Check if user is patient
   */
  async isPatient(): Promise<boolean> {
    return await this.hasRole('patient')
  }

  /**
   * Check if user is admin
   */
  async isAdmin(): Promise<boolean> {
    return await this.hasRole('admin')
  }

  /**
   * Get age in years
   */
  get age(): number | null {
    if (!this.dateOfBirth) return null
    return Math.floor(DateTime.now().diff(this.dateOfBirth, 'years').years)
  }

  /**
   * Check if user has permission
   */
  async hasPermission(permissionName: string, tenantId?: number): Promise<boolean> {
    if (await this.isAdmin()) return true
    
    // Check direct permissions
    const directPermission = await UserPermission.query()
      .where('user_id', this.id)
      .whereHas('permission', (query) => {
        query.where('name', permissionName)
      })
      .where('is_active', true)
      .where('tenant_id', tenantId || this.tenantId)
      .first()
    
    if (directPermission) return true
    
    // Check role permissions
    const roles = await this.getActiveRoles(tenantId)
    for (const role of roles) {
      if (await role.hasPermission(permissionName, tenantId)) {
        return true
      }
    }
    
    return false
  }

  /**
   * Get active roles for user
   */
  async getActiveRoles(tenantId?: number): Promise<Role[]> {
    const query = UserRole.query()
      .where('user_id', this.id)
      .where('is_active', true)
      .preload('role')
    
    if (tenantId) {
      query.where('tenant_id', tenantId)
    } else if (this.tenantId) {
      query.where('tenant_id', this.tenantId)
    }
    
    const userRoles = await query
    return userRoles.map(ur => ur.role)
  }

  /**
   * Check if user has role
   */
  async hasRole(roleName: string, tenantId?: number): Promise<boolean> {
    const roles = await this.getActiveRoles(tenantId)
    return roles.some(role => role.name === roleName)
  }

  /**
   * Assign role to user
   */
  async assignRole(roleId: number, tenantId?: number, assignedBy?: number): Promise<void> {
    const existingRole = await UserRole.query()
      .where('user_id', this.id)
      .where('role_id', roleId)
      .where('tenant_id', tenantId || this.tenantId)
      .first()
    
    if (existingRole) {
      existingRole.isActive = true
      await existingRole.save()
    } else {
      await UserRole.create({
        userId: this.id,
        roleId,
        tenantId: tenantId || this.tenantId,
        assignedBy,
        isActive: true
      })
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(roleId: number, tenantId?: number): Promise<void> {
    const userRole = await UserRole.query()
      .where('user_id', this.id)
      .where('role_id', roleId)
      .where('tenant_id', tenantId || this.tenantId)
      .first()
    
    if (userRole) {
      userRole.isActive = false
      await userRole.save()
    }
  }

  /**
   * Update last login information
   */
  async updateLastLogin(ipAddress: string): Promise<void> {
    this.lastLoginAt = DateTime.now()
    this.lastLoginIp = ipAddress
    await this.save()
  }

  /**
   * Generate new sync token
   */
  async regenerateSyncToken(): Promise<string> {
    this.syncToken = uuidv4()
    await this.save()
    return this.syncToken
  }

  /**
   * Soft delete user
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    this.status = 'inactive'
    await this.save()
  }

  /**
   * Find users by role within tenant
   */
  static async findByRoleInTenant(tenantId: number, roleName: string) {
    return await User.query()
      .whereHas('userRoles', (query) => {
        query.where('tenant_id', tenantId)
          .where('is_active', true)
          .whereHas('role', (roleQuery) => {
            roleQuery.where('name', roleName)
          })
      })
      .where('status', 'active')
      .whereNull('deleted_at')
  }

  /**
   * Find independent patients (without tenant)
   */
  static async findIndependentPatients() {
    return await User.query()
      .whereNull('tenant_id')
      .whereHas('userRoles', (query) => {
        query.where('is_active', true)
          .whereHas('role', (roleQuery) => {
            roleQuery.where('name', 'patient')
          })
      })
      .where('status', 'active')
      .whereNull('deleted_at')
  }

  /**
   * Search users within tenant or independent patients
   */
  static async searchInTenant(tenantId: number | null, searchTerm: string) {
    const query = User.query()
      .where('status', 'active')
      .whereNull('deleted_at')
      .where((subQuery) => {
        subQuery
          .whereILike('first_name', `%${searchTerm}%`)
          .orWhereILike('last_name', `%${searchTerm}%`)
          .orWhereILike('email', `%${searchTerm}%`)
      })

    if (tenantId) {
      query.where('tenant_id', tenantId)
    } else {
      query.whereNull('tenant_id')
    }

    return await query
  }

  /**
   * Find user by email for authentication
   */
  static async findForAuth(value: string): Promise<User | null> {
    const user = await User.query()
      .where('email', value)
      .where('status', 'active')
      .whereNull('deleted_at')
      .first()
    
    return user
  }

  /**
   * Verify user credentials
   */
  static async verifyCredentials(email: string, password: string): Promise<User | null> {
    const user = await User.findForAuth(email)
    if (!user) {
      return null
    }

    try {
      const isPasswordValid = await Hash.verify(user.password, password)
      
      if (!isPasswordValid) {
        return null
      }

      return user
    } catch (error) {
      return null
    }
  }
}
