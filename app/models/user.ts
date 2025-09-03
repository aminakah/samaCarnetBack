import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { v4 as uuidv4 } from 'uuid'
import Tenant from './tenant.js'
import VaccineSchedule from './vaccine_schedule.js'

/**
 * User model supporting multiple roles within a tenant
 * Includes patient and medical staff information
 */
export default class User extends BaseModel {
  static accessTokens = DbAccessTokensProvider.forModel(User)

  @column({ isPrimary: true })
  declare id: number

  // Tenant relationship
  @column()
  declare tenantId: number

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

  // Role and permissions
  @column()
  declare role: 'admin' | 'doctor' | 'midwife' | 'patient'

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare permissions: string[] | null

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
  @belongsTo(() => Tenant,
{  foreignKey: 'tenantId'}
)
  declare tenant: BelongsTo<typeof Tenant>

  @hasMany(() => VaccineSchedule, {
    foreignKey: 'patientId',
  })
  declare vaccineSchedules: HasMany<typeof VaccineSchedule>

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
  get isMedicalStaff(): boolean {
    return ['doctor', 'midwife'].includes(this.role)
  }

  /**
   * Check if user is patient
   */
  get isPatient(): boolean {
    return this.role === 'patient'
  }

  /**
   * Check if user is admin
   */
  get isAdmin(): boolean {
    return this.role === 'admin'
  }

  /**
   * Get age in years
   */
  get age(): number | null {
    if (!this.dateOfBirth) return null
    return DateTime.now().diff(this.dateOfBirth, 'years').years
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    if (this.isAdmin) return true
    if (!this.permissions) return false
    return this.permissions.includes(permission)
  }

  /**
   * Add permission to user
   */
  async addPermission(permission: string): Promise<void> {
    const permissions = this.permissions || []
    if (!permissions.includes(permission)) {
      permissions.push(permission)
      this.permissions = permissions
      await this.save()
    }
  }

  /**
   * Remove permission from user
   */
  async removePermission(permission: string): Promise<void> {
    if (!this.permissions) return
    this.permissions = this.permissions.filter(p => p !== permission)
    await this.save()
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
  static async findByRoleInTenant(tenantId: number, role: string) {
    return await User.query()
      .where('tenant_id', tenantId)
      .where('role', role)
      .where('status', 'active')
      .whereNull('deleted_at')
  }

  /**
   * Search users within tenant
   */
  static async searchInTenant(tenantId: number, searchTerm: string) {
    return await User.query()
      .where('tenant_id', tenantId)
      .where('status', 'active')
      .whereNull('deleted_at')
      .where((query) => {
        query
          .whereILike('first_name', `%${searchTerm}%`)
          .orWhereILike('last_name', `%${searchTerm}%`)
          .orWhereILike('email', `%${searchTerm}%`)
      })
  }

  /**
   * Find user by email for authentication
   */
  static async findForAuth(_uids: string[], value: string): Promise<User | null> {
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
    const user = await User.findForAuth(['email'], email)
    
    if (!user) {
      return null
    }

    const isPasswordValid = await Hash.verify(user.password, password)
    
    if (!isPasswordValid) {
      return null
    }

    return user
  }
}
