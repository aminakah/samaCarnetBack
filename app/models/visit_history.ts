import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Visite from './visite.js'
import Personnel from './personnel.js'
import Patient from './patient.js'

export default class VisitHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare visitId: number

  @column()
  declare modifiedBy: number

  @column()
  declare action: 'created' | 'updated' | 'cancelled' | 'completed' | 'rescheduled'

  @column({
    prepare: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare changes: Record<string, any> | null

  @column()
  declare reason: string | null

  @column.dateTime()
  declare actionDate: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Visite)
  declare visit: BelongsTo<typeof Visite>

  @belongsTo(() => Personnel)
  declare modifiedByPersonnel: BelongsTo<typeof Personnel>

  @belongsTo(() => Patient, {
    foreignKey: 'visitId',
    localKey: 'id'
  })
  declare patient: BelongsTo<typeof Patient>
}