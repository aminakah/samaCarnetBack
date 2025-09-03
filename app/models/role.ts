import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Tenant from './tenant.js'
import TypePersonnel from './type_personnel.js'
import UserRole from './user_role.js'
import Permission from './permission.js'
import RolePermission from './role_permission.js'

/**
 * Role model for RBAC system
 */
export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tenantId: number | null

  @column()
  declare name: string

  @column()
  declare displayName: string

  @column()
  declare description: string | null

  @column()
  declare level: number

  @column()
  declare isSystem: boolean

  @column()
  declare isMedical: boolean

  @column()
  declare isAdministrative: boolean

  @column()
  declare typePersonnelId: number | null

  @column({
    prepare: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare metadata: Record<string, any> | null

  @column()
  declare maxUsers: number | null

  @column()
  declare isActive: boolean

  @column()
  declare isAssignable: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => TypePersonnel)
  declare typePersonnel: BelongsTo<typeof TypePersonnel>

  @hasMany(() => UserRole)
  declare userRoles: HasMany<typeof UserRole>

  @hasMany(() => RolePermission)
  declare rolePermissions: HasMany<typeof RolePermission>

  @manyToMany(() => Permission, {
    pivotTable: 'role_permissions',
    localKey: 'id',
    pivotForeignKey: 'role_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'permission_id',
  })
  declare permissions: ManyToMany<typeof Permission>

  /**
   * Check if role has specific permission
   */
  async hasPermission(permissionName: string, tenantId?: number): Promise<boolean> {
    const query = RolePermission.query()
      .where('role_id', this.id)
      .whereHas('permission', (permQuery) => {
        permQuery.where('name', permissionName)
      })
      .where('is_active', true)

    if (tenantId) {
      query.where((subQuery) => {
        subQuery.where('tenant_id', tenantId).orWhereNull('tenant_id')
      })
    }

    const rolePermission = await query.first()
    return !!rolePermission
  }

  /**
   * Get all permissions for this role
   */
  async getAllPermissions(tenantId?: number) {
    const query = (this.related('permissions') as any).query()
      .pivotColumns(['tenant_id', 'conditions', 'scope_override', 'is_active'])
      .wherePivot('is_active', true)

    if (tenantId) {
      query.where((subQuery: any) => {
        subQuery.wherePivot('tenant_id', tenantId).orWherePivotNull('tenant_id')
      })
    }

    return await query
  }

  /**
   * Add permission to role
   */
  async addPermission(
    permissionId: number,
    options: {
      tenantId?: number
      conditions?: Record<string, any>
      scopeOverride?: 'own' | 'department' | 'tenant' | 'global'
      grantedBy?: number
      grantReason?: string
    } = {}
  ) {
    const existing = await RolePermission.query()
      .where('role_id', this.id)
      .where('permission_id', permissionId)
      .where('tenant_id', options.tenantId ?? null)
      .first()

    if (existing) {
      existing.isActive = true
      existing.scopeOverride = options.scopeOverride || existing.scopeOverride
      existing.conditions = options.conditions || existing.conditions
      await existing.save()
      return existing
    }

    return await RolePermission.create({
      roleId: this.id,
      permissionId,
      tenantId: options.tenantId || null,
      conditions: options.conditions,
      scopeOverride: options.scopeOverride,
      grantedBy: options.grantedBy,
      grantReason: options.grantReason,
      isActive: true
    })
  }

  /**
   * Remove permission from role
   */
  async removePermission(permissionId: number, tenantId?: number) {
    const rolePermission = await RolePermission.query()
      .where('role_id', this.id)
      .where('permission_id', permissionId)
      .where('tenant_id', tenantId ?? null)
      .first()

    if (rolePermission) {
      rolePermission.isActive = false
      await rolePermission.save()
    }
  }

  /**
   * Get users with this role in a tenant
   */
  async getUsersInTenant(tenantId: number) {
    return await UserRole.query()
      .where('role_id', this.id)
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .preload('user')
      .orderBy('assigned_at', 'desc')
  }

  /**
   * Check if role can be assigned to more users
   */
  async canAssignMoreUsers(tenantId: number): Promise<boolean> {
    if (!this.maxUsers) return true

    const currentCount = await UserRole.query()
      .where('role_id', this.id)
      .where('tenant_id', tenantId)
      .where('is_active', true)
      .count('* as total')

    return Number(currentCount[0].$extras.total) < this.maxUsers
  }

  /**
   * Find roles by capabilities
   */
  static async findByCapabilities(
    tenantId: number | null,
    options: {
      isMedical?: boolean
      isAdministrative?: boolean
      minLevel?: number
      typePersonnelId?: number
    } = {}
  ) {
    const query = this.query()
      .where('is_active', true)
      .where('is_assignable', true)

    if (tenantId) {
      query.where((subQuery) => {
        subQuery.where('tenant_id', tenantId).orWhereNull('tenant_id')
      })
    }

    if (options.isMedical !== undefined) {
      query.where('is_medical', options.isMedical)
    }

    if (options.isAdministrative !== undefined) {
      query.where('is_administrative', options.isAdministrative)
    }

    if (options.minLevel) {
      query.where('level', '>=', options.minLevel)
    }

    if (options.typePersonnelId) {
      query.where('type_personnel_id', options.typePersonnelId)
    }

    return await query
      .preload('typePersonnel')
      .orderBy('level', 'desc')
      .orderBy('name')
  }

  /**
   * Create system role
   */
  static async createSystemRole(data: {
    name: string
    displayName: string
    description?: string
    level: number
    isMedical?: boolean
    isAdministrative?: boolean
    typePersonnelId?: number
    metadata?: Record<string, any>
  }) {
    return await this.create({
      ...data,
      tenantId: null,
      isSystem: true,
      isActive: true,
      isAssignable: true
    })
  }
}