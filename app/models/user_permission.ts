import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Tenant from './tenant.js'
import Permission from './permission.js'

/**
 * UserPermission model for direct user permissions and delegations
 */
export default class UserPermission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare tenantId: number

  @column()
  declare permissionId: number

  @column()
  declare grantType: 'direct' | 'delegation' | 'temporary' | 'emergency'

  @column({
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value: string) => value ? JSON.parse(value) : null,
  })
  declare conditions: Record<string, any> | null

  @column()
  declare scopeOverride: 'own' | 'department' | 'tenant' | 'global' | null

  @column.dateTime()
  declare grantedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare lastUsedAt: DateTime | null

  @column()
  declare grantedBy: number | null

  @column()
  declare grantReason: string

  @column()
  declare delegatedFrom: number | null

  @column.dateTime()
  declare delegationStart: DateTime | null

  @column.dateTime()
  declare delegationEnd: DateTime | null

  @column()
  declare isActive: boolean

  @column()
  declare requiresApproval: boolean

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column()
  declare approvedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => Permission)
  declare permission: BelongsTo<typeof Permission>

  @belongsTo(() => User, {
    foreignKey: 'grantedBy',
  })
  declare grantor: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'delegatedFrom',
  })
  declare delegator: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'approvedBy',
  })
  declare approver: BelongsTo<typeof User>

  /**
   * Check if permission is currently valid
   */
  get isCurrentlyValid(): boolean {
    if (!this.isActive) return false
    if (this.requiresApproval && !this.approvedAt) return false
    
    const now = DateTime.now()
    
    if (this.expiresAt && this.expiresAt < now) return false
    
    // Check delegation period
    if (this.grantType === 'delegation') {
      if (this.delegationStart && this.delegationStart > now) return false
      if (this.delegationEnd && this.delegationEnd < now) return false
    }
    
    return true
  }

  /**
   * Check if permission is expired
   */
  get isExpired(): boolean {
    const now = DateTime.now()
    
    if (this.expiresAt && this.expiresAt < now) return true
    if (this.grantType === 'delegation' && this.delegationEnd && this.delegationEnd < now) return true
    
    return false
  }

  /**
   * Get effective scope
   */
  async getEffectiveScope(): Promise<'own' | 'department' | 'tenant' | 'global'> {
    if (this.scopeOverride) {
      return this.scopeOverride
    }
    
    await this.load('permission')
    return this.permission.scope
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(): Promise<void> {
    this.lastUsedAt = DateTime.now()
    await this.save()
  }

  /**
   * Approve permission (if requires approval)
   */
  async approve(approvedBy: number): Promise<void> {
    if (!this.requiresApproval) {
      throw new Error('Permission does not require approval')
    }
    
    this.approvedBy = approvedBy
    this.approvedAt = DateTime.now()
    await this.save()
  }

  /**
   * Revoke permission
   */
  async revoke(): Promise<void> {
    this.isActive = false
    this.expiresAt = DateTime.now()
    await this.save()
  }

  /**
   * Extend expiration
   */
  async extend(duration: { hours?: number; days?: number; months?: number }): Promise<void> {
    if (!this.expiresAt) {
      this.expiresAt = DateTime.now()
    }
    
    if (duration.hours) {
      this.expiresAt = this.expiresAt.plus({ hours: duration.hours })
    }
    if (duration.days) {
      this.expiresAt = this.expiresAt.plus({ days: duration.days })
    }
    if (duration.months) {
      this.expiresAt = this.expiresAt.plus({ months: duration.months })
    }
    
    await this.save()
  }

  /**
   * Find active permissions for user
   */
  static async findActiveForUser(userId: number, tenantId: number) {
    return await this.query()
      .where('user_id', userId)
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .where((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
      .where((query) => {
        // Handle delegation periods
        query.where('grant_type', '!=', 'delegation')
          .orWhere((subQuery) => {
            subQuery
              .where('grant_type', 'delegation')
              .where((dateQuery) => {
                dateQuery
                  .whereNull('delegation_start')
                  .orWhere('delegation_start', '<=', DateTime.now().toSQL())
              })
              .where((dateQuery) => {
                dateQuery
                  .whereNull('delegation_end')
                  .orWhere('delegation_end', '>', DateTime.now().toSQL())
              })
          })
      })
      .preload('permission')
      .orderBy('granted_at', 'desc')
  }

  /**
   * Find delegations from user
   */
  static async findDelegationsFrom(delegatorId: number, tenantId: number) {
    return await this.query()
      .where('delegated_from', delegatorId)
      .where('tenant_id', tenantId)
      .where('grant_type', 'delegation')
      .where('is_active', true)
      .preload('user')
      .preload('permission')
      .orderBy('delegation_end', 'asc')
  }

  /**
   * Find permissions requiring approval
   */
  static async findPendingApproval(tenantId: number) {
    return await this.query()
      .where('tenant_id', tenantId)
      .where('requires_approval', true)
      .whereNull('approved_at')
      .where('is_active', true)
      .preload('user')
      .preload('permission')
      .preload('grantor')
      .orderBy('granted_at', 'asc')
  }

  /**
   * Find expiring permissions
   */
  static async findExpiringSoon(tenantId: number, hoursAhead: number = 24) {
    const futureDate = DateTime.now().plus({ hours: hoursAhead })
    
    return await this.query()
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .whereNotNull('expires_at')
      .whereBetween('expires_at', [DateTime.now().toSQL(), futureDate.toSQL()])
      .preload('user')
      .preload('permission')
      .orderBy('expires_at', 'asc')
  }

  /**
   * Create delegation
   */
  static async createDelegation(data: {
    delegatorId: number
    userId: number
    tenantId: number
    permissionId: number
    delegationStart?: DateTime
    delegationEnd: DateTime
    grantReason: string
    conditions?: Record<string, any>
  }) {
    // Verify delegator has the permission
    const delegatorPermission = await this.query()
      .where('user_id', data.delegatorId)
      .where('tenant_id', data.tenantId)
      .where('permission_id', data.permissionId)
      .where('is_active', true)
      .first()

    if (!delegatorPermission || !delegatorPermission?.isCurrentlyValid) {
      throw new Error('Delegator does not have this permission')
    }

    return await this.create({
      userId: data.userId,
      tenantId: data.tenantId,
      permissionId: data.permissionId,
      grantType: 'delegation',
      delegatedFrom: data.delegatorId,
      delegationStart: data.delegationStart || DateTime.now(),
      delegationEnd: data.delegationEnd,
      grantedBy: data.delegatorId,
      grantedAt: DateTime.now(),
      grantReason: data.grantReason,
      conditions: data.conditions,
      isActive: true,
      requiresApproval: false
    })
  }

  /**
   * Create emergency permission
   */
  static async createEmergencyPermission(data: {
    userId: number
    tenantId: number
    permissionId: number
    grantedBy: number
    grantReason: string
    durationHours?: number
  }) {
    const expiresAt = DateTime.now().plus({ hours: data.durationHours || 2 })

    return await this.create({
      userId: data.userId,
      tenantId: data.tenantId,
      permissionId: data.permissionId,
      grantType: 'emergency',
      grantedBy: data.grantedBy,
      grantedAt: DateTime.now(),
      expiresAt,
      grantReason: data.grantReason,
      isActive: true,
      requiresApproval: false
    })
  }
}