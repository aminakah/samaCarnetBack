import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
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
  declare name: string

  @column()
  declare displayName: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @hasMany(() => User)
  declare users: HasMany<typeof User>

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
  async hasPermission(permissionName: string): Promise<boolean> {
    const rolePermission = await RolePermission.query()
      .where('role_id', this.id)
      .whereHas('permission', (permQuery) => {
        permQuery.where('name', permissionName)
      })
      .first()
    return !!rolePermission
  }

  /**
   * Get all permissions for this role
   */
  async getAllPermissions() {
    return await this.related('permissions').query()
  }

  /**
   * Add permission to role
   */
  async addPermission(permissionId: number) {
    const existing = await RolePermission.query()
      .where('role_id', this.id)
      .where('permission_id', permissionId)
      .first()

    if (!existing) {
      return await RolePermission.create({
        roleId: this.id,
        permissionId
      })
    }
    return existing
  }

  /**
   * Remove permission from role
   */
  async removePermission(permissionId: number) {
    await RolePermission.query()
      .where('role_id', this.id)
      .where('permission_id', permissionId)
      .delete()
  }

  /**
   * Find all active roles
   */
  static async findActive() {
    return await this.query().orderBy('name')
  }
}