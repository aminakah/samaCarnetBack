import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class SuperAdmin extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare accessLevel: string

  @column({
    prepare: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare permissionsOverride: Record<string, any> | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Check if super admin has full access
   */
  get hasFullAccess(): boolean {
    return this.accessLevel === 'full'
  }

  /**
   * Soft delete super admin
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    await this.save()
  }
}