import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class MedicalHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare patientId: number

  @column()
  declare type: 'allergy' | 'condition' | 'surgery' | 'medication' | 'family_history'

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.date()
  declare dateRecorded: DateTime | null

  @column()
  declare severity: 'low' | 'medium' | 'high' | 'critical' | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  /**
   * Soft delete medical history
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    this.isActive = false
    await this.save()
  }
}