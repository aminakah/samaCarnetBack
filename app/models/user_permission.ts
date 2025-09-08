import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Permission from './permission.js'
import Tenant from './tenant.js'

export default class UserPermission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare permissionId: number

  @column()
  declare tenantId: number | null

  @column()
  declare grantedBy: number | null

  @column()
  declare grantReason: string | null

  @column()
  declare scopeOverride: 'own' | 'department' | 'tenant' | 'global' | null

  @column({
    prepare: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare conditions: Record<string, any> | null

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare grantedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Permission)
  declare permission: BelongsTo<typeof Permission>

  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => User, { foreignKey: 'grantedBy' })
  declare grantedByUser: BelongsTo<typeof User>
}