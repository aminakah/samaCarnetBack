import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import Permission from './permission.js'
import Tenant from './tenant.js'
import User from './user.js'

/**
 * RolePermission model for role-permission assignments
 */
export default class RolePermission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roleId: number

  @column()
  declare permissionId: number

  @column()
  declare tenantId: number | null

  @column({
    prepare: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare conditions: Record<string, any> | null

  @column()
  declare scopeOverride: 'own' | 'department' | 'tenant' | 'global' | null

  @column.dateTime()
  declare validFrom: DateTime | null

  @column.dateTime()
  declare validUntil: DateTime | null

  @column()
  declare grantedBy: number | null

  @column.dateTime()
  declare grantedAt: DateTime

  @column()
  declare grantReason: string | null

  @column()
  declare isActive: boolean

  @column()
  declare isInherited: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => Permission)
  declare permission: BelongsTo<typeof Permission>

  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => User, {
    foreignKey: 'grantedBy',
  })
  declare grantor: BelongsTo<typeof User>

  /**
   * Check if permission is currently valid
   */
  get isCurrentlyValid(): boolean {
    if (!this.isActive) return false
    
    const now = DateTime.now()
    
    if (this.validFrom && this.validFrom > now) return false
    if (this.validUntil && this.validUntil < now) return false
    
    return true
  }

  /**
   * Get effective scope (considering overrides)
   */
  async getEffectiveScope(): Promise<'own' | 'department' | 'tenant' | 'global'> {
    if (this.scopeOverride) {
      return this.scopeOverride
    }
    
    await this.load('permission')
    return this.permission.scope
  }

  /**
   * Check if conditions are met for context
   */
  checkConditions(context: Record<string, any>): boolean {
    if (!this.conditions || Object.keys(this.conditions).length === 0) {
      return true
    }

    for (const [key, value] of Object.entries(this.conditions)) {
      if (context[key] !== value) {
        return false
      }
    }

    return true
  }

  /**
   * Extend validity period
   */
  async extendValidity(duration: { days?: number; months?: number; years?: number }): Promise<void> {
    if (!this.validUntil) {
      this.validUntil = DateTime.now()
    }
    
    if (duration.days) {
      this.validUntil = this.validUntil.plus({ days: duration.days })
    }
    if (duration.months) {
      this.validUntil = this.validUntil.plus({ months: duration.months })
    }
    if (duration.years) {
      this.validUntil = this.validUntil.plus({ years: duration.years })
    }
    
    await this.save()
  }

  /**
   * Revoke permission
   */
  async revoke(): Promise<void> {
    this.isActive = false
    this.validUntil = DateTime.now()
    await this.save()
  }

  /**
   * Find active permissions for role
   */
  static async findActiveForRole(roleId: number, tenantId?: number) {
    const query = this.query()
      .where('role_id', roleId)
      .where('is_active', true)
      .where((subQuery) => {
        subQuery.whereNull('valid_from').orWhere('valid_from', '<=', DateTime.now().toSQL())
      })
      .where((subQuery) => {
        subQuery.whereNull('valid_until').orWhere('valid_until', '>', DateTime.now().toSQL())
      })
      .preload('permission')

    if (tenantId !== undefined) {
      query.where((subQuery) => {
        subQuery.where('tenant_id', tenantId).orWhereNull('tenant_id')
      })
    }

    return await query.orderBy('created_at', 'desc')
  }

  /**
   * Find permissions expiring soon
   */
  static async findExpiringSoon(roleId: number, daysAhead: number = 30) {
    const futureDate = DateTime.now().plus({ days: daysAhead })
    
    return await this.query()
      .where('role_id', roleId)
      .where('is_active', true)
      .whereNotNull('valid_until')
      .whereBetween('valid_until', [DateTime.now().toSQL(), futureDate.toSQL()])
      .preload('permission')
      .preload('role')
      .orderBy('valid_until', 'asc')
  }

  /**
   * Find roles with specific permission
   */
  static async findRolesWithPermission(permissionId: number, tenantId?: number) {
    const query = this.query()
      .where('permission_id', permissionId)
      .where('is_active', true)
      .preload('role', (roleQuery) => {
        roleQuery.preload('typePersonnel')
      })

    if (tenantId !== undefined) {
      query.where((subQuery) => {
        subQuery.where('tenant_id', tenantId).orWhereNull('tenant_id')
      })
    }

    return await query.orderBy('created_at', 'desc')
  }

  /**
   * Bulk assign permissions to role
   */
  static async bulkAssignToRole(
    roleId: number,
    permissionIds: number[],
    options: {
      tenantId?: number
      grantedBy?: number
      grantReason?: string
      validUntil?: DateTime
      conditions?: Record<string, any>
    } = {}
  ) {
    const assignments = permissionIds.map(permissionId => ({
      roleId,
      permissionId,
      tenantId: options.tenantId || null,
      grantedBy: options.grantedBy,
      grantedAt: DateTime.now(),
      grantReason: options.grantReason,
      validUntil: options.validUntil,
      conditions: options.conditions,
      isActive: true,
      isInherited: false
    }))

    return await this.createMany(assignments)
  }

  /**
   * Sync permissions for role (add new, remove old)
   */
  static async syncRolePermissions(
    roleId: number,
    permissionIds: number[],
    options: {
      tenantId?: number
      grantedBy?: number
      grantReason?: string
    } = {}
  ) {
    // Get current active permissions
    const currentPermissions = await this.findActiveForRole(roleId, options.tenantId)
    const currentPermissionIds = currentPermissions.map(p => p.permissionId)

    // Find permissions to add and remove
    const toAdd = permissionIds.filter(id => !currentPermissionIds.includes(id))
    const toRemove = currentPermissionIds.filter(id => !permissionIds.includes(id))

    // Remove old permissions
    if (toRemove.length > 0) {
      await this.query()
        .whereIn('permission_id', toRemove)
        .where('role_id', roleId)
        .where('tenant_id', options.tenantId ?? null)
        .update({ isActive: false })
    }

    // Add new permissions
    if (toAdd.length > 0) {
      await this.bulkAssignToRole(roleId, toAdd, options)
    }

    return {
      added: toAdd.length,
      removed: toRemove.length
    }
  }
}