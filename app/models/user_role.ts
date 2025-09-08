import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Role from './role.js'
import Tenant from './tenant.js'

export default class UserRole extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare roleId: number

  @column()
  declare tenantId: number | null

  @column()
  declare assignedBy: number | null

  @column()
  declare department: string | null

  @column()
  declare service: string | null

  @column({
    prepare: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare context: Record<string, any> | null

  @column.dateTime()
  declare assignedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare lastUsedAt: DateTime | null

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

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => User, { foreignKey: 'assignedBy' })
  declare assignedByUser: BelongsTo<typeof User>
}