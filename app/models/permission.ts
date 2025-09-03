import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import RolePermission from './role_permission.js'
import UserPermission from './user_permission.js'

/**
 * Permission model for RBAC system
 */
export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare displayName: string

  @column()
  declare description: string | null

  @column()
  declare module: string

  @column()
  declare action: string

  @column()
  declare scope: 'own' | 'department' | 'tenant' | 'global'

  @column()
  declare requiresSupervision: boolean

  @column()
  declare minLevelRequired: number | null

  @column()
  declare isSystem: boolean

  @column()
  declare isMedical: boolean

  @column()
  declare isSensitive: boolean

  @column()
  declare requiresAudit: boolean

  @column({
    prepare: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare conditions: Record<string, any> | null

  @column({
    prepare: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare metadata: Record<string, any> | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @hasMany(() => RolePermission)
  declare rolePermissions: HasMany<typeof RolePermission>

  @hasMany(() => UserPermission)
  declare userPermissions: HasMany<typeof UserPermission>

  @manyToMany(() => Role, {
    pivotTable: 'role_permissions',
    localKey: 'id',
    pivotForeignKey: 'permission_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Role>

  /**
   * Get full permission identifier
   */
  get fullName(): string {
    return `${this.module}.${this.action}`
  }

  /**
   * Check if permission applies to resource
   */
  appliesToResource(resourceType: string): boolean {
    return this.module === resourceType || this.module === 'all'
  }

  /**
   * Check if permission allows specific action
   */
  allowsAction(actionName: string): boolean {
    return this.action === actionName || this.action === 'all'
  }

  /**
   * Get security level (for audit purposes)
   */
  get securityLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.isSensitive || this.action === 'delete') return 'critical'
    if (this.isMedical || this.requiresSupervision) return 'high'
    if (this.scope === 'tenant' || this.scope === 'global') return 'medium'
    return 'low'
  }

  /**
   * Find permissions by module
   */
  static async findByModule(moduleName: string, options: {
    includeInactive?: boolean
    medicalOnly?: boolean
    minSecurityLevel?: string
  } = {}) {
    const { includeInactive = false, medicalOnly = false } = options
    
    const query = this.query().where('module', moduleName)

    if (!includeInactive) {
      query.where('is_active', true)
    }

    if (medicalOnly) {
      query.where('is_medical', true)
    }

    return await query.orderBy('action')
  }

  /**
   * Find permissions by action
   */
  static async findByAction(actionName: string) {
    return await this.query()
      .where('action', actionName)
      .where('is_active', true)
      .orderBy('module')
  }

  /**
   * Get all medical permissions
   */
  static async getMedicalPermissions() {
    return await this.query()
      .where('is_medical', true)
      .where('is_active', true)
      .orderBy('module')
      .orderBy('action')
  }

  /**
   * Get sensitive permissions requiring audit
   */
  static async getSensitivePermissions() {
    return await this.query()
      .where((query) => {
        query.where('is_sensitive', true).orWhere('requires_audit', true)
      })
      .where('is_active', true)
      .orderBy('module')
      .orderBy('action')
  }

  /**
   * Create permission with validation
   */
  static async createPermission(data: {
    name: string
    displayName: string
    description?: string
    module: string
    action: string
    scope?: 'own' | 'department' | 'tenant' | 'global'
    requiresSupervision?: boolean
    minLevelRequired?: number
    isMedical?: boolean
    isSensitive?: boolean
    requiresAudit?: boolean
    conditions?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    // Ensure name follows convention
    const fullName = data.name || `${data.module}.${data.action}`
    
    // Check if permission already exists
    const existing = await this.findBy('name', fullName)
    if (existing) {
      throw new Error(`Permission ${fullName} already exists`)
    }

    return await this.create({
      ...data,
      name: fullName,
      scope: data.scope || 'own',
      requiresSupervision: data.requiresSupervision || false,
      isMedical: data.isMedical || false,
      isSensitive: data.isSensitive || false,
      requiresAudit: data.requiresAudit || false,
      isSystem: true,
      isActive: true
    })
  }

  /**
   * Check permissions hierarchy (for inheritance)
   */
  static async getPermissionHierarchy(moduleName: string) {
    const permissions = await this.findByModule(moduleName)
    
    // Group by action priority
    const hierarchy = {
      read: permissions.filter(p => p.action === 'read'),
      create: permissions.filter(p => p.action === 'create'),
      update: permissions.filter(p => p.action === 'update'),
      delete: permissions.filter(p => p.action === 'delete'),
      special: permissions.filter(p => !['read', 'create', 'update', 'delete'].includes(p.action))
    }

    return hierarchy
  }

  /**
   * Get permissions for role template
   */
  static async getPermissionsForRoleTemplate(template: {
    isMedical?: boolean
    isAdministrative?: boolean
    level: number
    modules: string[]
    actions: string[]
  }) {
    const query = this.query()
      .whereIn('module', template.modules)
      .whereIn('action', template.actions)
      .where('is_active', true)

    if (template.isMedical) {
      query.where('is_medical', true)
    }

    if (template.level) {
      query.where((subQuery) => {
        subQuery.whereNull('min_level_required')
          .orWhere('min_level_required', '<=', template.level)
      })
    }

    return await query.orderBy('module').orderBy('action')
  }
}