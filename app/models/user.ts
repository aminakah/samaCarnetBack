import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeSave, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { v4 as uuidv4 } from 'uuid'
import VaccineSchedule from './vaccine_schedule.js'
import Role from './role.js'
import UserRole from './user_role.js'
import UserPermission from './user_permission.js'
import Personnel from './personnel.js'
import Patient from './patient.js'
import SuperAdmin from './super_admin.js'

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
  declare roleId: number

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
  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

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

  @hasOne(() => Personnel, {
    foreignKey: 'userId'
  })
  declare personnel: HasOne<typeof Personnel>

  @hasOne(() => Patient, {
    foreignKey: 'userId'
  })
  declare patient: HasOne<typeof Patient>

  @hasOne(() => SuperAdmin, {
    foreignKey: 'userId'
  })
  declare superAdmin: HasOne<typeof SuperAdmin>

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
    await this.load('role')
    return this.role.name.includes('doctor') || this.role.name.includes('midwife')
  }

  /**
   * Check if user is patient
   */
  async isPatient(): Promise<boolean> {
    await this.load('role')
    return this.role.name === 'patient'
  }

  /**
   * Check if user is admin
   */
  async isAdmin(): Promise<boolean> {
    await this.load('role')
    return this.role.name === 'admin'
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
  async hasPermission(permissionName: string): Promise<boolean> {
    if (await this.isAdmin()) return true
    
    // Check direct permissions
    const directPermission = await UserPermission.query()
      .where('user_id', this.id)
      .whereHas('permission', (query) => {
        query.where('name', permissionName)
      })
      .first()
    
    if (directPermission) return true
    
    // Check role permissions
    await this.load('role')
    return await this.role.hasPermission(permissionName)
  }

  /**
   * Check if user has role
   */
  async hasRole(roleName: string): Promise<boolean> {
    await this.load('role')
    return this.role.name === roleName
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
   * Find users by role
   */
  static async findByRole(roleName: string) {
    return await User.query()
      .whereHas('role', (query) => {
        query.where('name', roleName)
      })
      .where('status', 'active')
      .whereNull('deleted_at')
  }

  /**
   * Search users
   */
  static async search(searchTerm: string) {
    return await User.query()
      .where('status', 'active')
      .whereNull('deleted_at')
      .where((subQuery) => {
        subQuery
          .whereILike('first_name', `%${searchTerm}%`)
          .orWhereILike('last_name', `%${searchTerm}%`)
          .orWhereILike('email', `%${searchTerm}%`)
      })
      .preload('role')
  }

  /**
   * Find user by email for authentication
   */
  static async findForAuth(value: string): Promise<User | null> {
    const user = await User.query()
      .where('email', value)
      .where('status', 'active')
      .whereNull('deleted_at')
      .preload('role')
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
