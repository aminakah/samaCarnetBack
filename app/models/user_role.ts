import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Tenant from './tenant.js'
import Role from './role.js'

/**
 * UserRole model for user-role assignments in multi-tenant context
 */
export default class UserRole extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare tenantId: number

  @column()
  declare roleId: number

  @column()
  declare department: string | null

  @column()
  declare service: string | null

  @column({
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value: string) => value ? JSON.parse(value) : null,
  })
  declare context: Record<string, any> | null

  @column.dateTime()
  declare assignedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare lastUsedAt: DateTime | null

  @column()
  declare assignedBy: number | null

  @column()
  declare assignmentReason: string | null

  @column()
  declare isActive: boolean

  @column()
  declare isPrimary: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => User, {
    foreignKey: 'assignedBy',
  })
  declare assignor: BelongsTo<typeof User>

  /**
   * Check if assignment is expired
   */
  get isExpired(): boolean {
    if (!this.expiresAt) return false
    return this.expiresAt < DateTime.now()
  }

  /**
   * Check if assignment is currently valid
   */
  get isValid(): boolean {
    return this.isActive && !this.isExpired
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(): Promise<void> {
    this.lastUsedAt = DateTime.now()
    await this.save()
  }

  /**
   * Extend expiration date
   */
  async extendExpiration(duration: { days?: number; months?: number; years?: number }): Promise<void> {
    if (!this.expiresAt) {
      this.expiresAt = DateTime.now()
    }
    
    if (duration.days) {
      this.expiresAt = this.expiresAt.plus({ days: duration.days })
    }
    if (duration.months) {
      this.expiresAt = this.expiresAt.plus({ months: duration.months })
    }
    if (duration.years) {
      this.expiresAt = this.expiresAt.plus({ years: duration.years })
    }
    
    await this.save()
  }

  /**
   * Deactivate assignment
   */
  async deactivate(): Promise<void> {
    this.isActive = false
    await this.save()
  }

  /**
   * Find active assignments for user in tenant
   */
  static async findActiveForUser(userId: number, tenantId: number) {
    return await this.query()
      .where('user_id', userId)
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .where((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
      .preload('role', (roleQuery) => {
        roleQuery.preload('typePersonnel')
      })
      .orderBy('is_primary', 'desc')
      .orderBy('assigned_at', 'desc')
  }

  /**
   * Find primary role for user in tenant
   */
  static async findPrimaryRole(userId: number, tenantId: number): Promise<UserRole | null> {
    return await this.query()
      .where('user_id', userId)
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .where('is_primary', true)
      .where((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
      .preload('role')
      .first()
  }

  /**
   * Set as primary role (deactivates other primary roles)
   */
  async setAsPrimary(): Promise<void> {
    // Deactivate other primary roles for this user in this tenant
    await UserRole.query()
      .where('user_id', this.userId)
      .where('tenant_id', this.tenantId)
      .where('is_primary', true)
      .whereNot('id', this.id)
      .update({ is_primary: false })

    this.isPrimary = true
    await this.save()
  }

  /**
   * Find users with specific role in tenant
   */
  static async findUsersWithRole(roleId: number, tenantId: number, options: {
    includeExpired?: boolean
    department?: string
    service?: string
  } = {}) {
    const { includeExpired = false, department, service } = options
    
    const query = this.query()
      .where('role_id', roleId)
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .preload('user')
      .preload('role')

    if (!includeExpired) {
      query.where((subQuery) => {
        subQuery.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
    }

    if (department) {
      query.where('department', department)
    }

    if (service) {
      query.where('service', service)
    }

    return await query.orderBy('assigned_at', 'desc')
  }

  /**
   * Find assignments expiring soon
   */
  static async findExpiringSoon(tenantId: number, daysAhead: number = 30) {
    const futureDate = DateTime.now().plus({ days: daysAhead })
    
    return await this.query()
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .whereNotNull('expires_at')
      .whereBetween('expires_at', [DateTime.now().toSQL(), futureDate.toSQL()])
      .preload('user')
      .preload('role')
      .orderBy('expires_at', 'asc')
  }

  /**
   * Create assignment with validation
   */
  static async createAssignment(data: {
    userId: number
    tenantId: number
    roleId: number
    assignedBy?: number
    assignmentReason?: string
    department?: string
    service?: string
    context?: Record<string, any>
    expiresAt?: DateTime
    isPrimary?: boolean
  }) {
    // Check if role can accept more users
    const role = await Role.findOrFail(data.roleId)
    const canAssign = await role.canAssignMoreUsers(data.tenantId)
    
    if (!canAssign) {
      throw new Error(`Role ${role.displayName} has reached maximum user limit`)
    }

    // Check for existing active assignment
    const existing = await this.query()
      .where('user_id', data.userId)
      .where('tenant_id', data.tenantId)
      .where('role_id', data.roleId)
      .where('is_active', true)
      .first()

    if (existing && existing.isValid) {
      throw new Error('User already has this role assigned')
    }

    const assignment = await this.create({
      ...data,
      assignedAt: DateTime.now(),
      isActive: true,
      isPrimary: data.isPrimary || false
    })

    if (data.isPrimary) {
      await assignment.setAsPrimary()
    }

    return assignment
  }
}