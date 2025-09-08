import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Patient from './patient.js'
import Tenant from './tenant.js'

export default class CrossTenantAccessLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare scannerUserId: number

  @column()
  declare scannerTenantId: number | null

  @column()
  declare patientId: number

  @column()
  declare patientTenantId: number

  @column()
  declare qrCode: string | null

  @column()
  declare accessLevel: 'full' | 'basic' | 'emergency' | 'none'

  @column()
  declare accessType: 'qr_scan' | 'emergency_token' | 'direct_access'

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => value ? JSON.parse(value) : null,
  })
  declare accessedData: Record<string, any> | null

  @column()
  declare accessGranted: boolean

  @column()
  declare denialReason: string | null

  @column.dateTime()
  declare accessedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, { foreignKey: 'scannerUserId' })
  declare scannerUser: BelongsTo<typeof User>

  @belongsTo(() => Tenant, { foreignKey: 'scannerTenantId' })
  declare scannerTenant: BelongsTo<typeof Tenant>

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  @belongsTo(() => Tenant, { foreignKey: 'patientTenantId' })
  declare patientTenant: BelongsTo<typeof Tenant>

  /**
   * Log cross-tenant access attempt
   */
  static async logAccess(data: {
    scannerUserId: number
    scannerTenantId: number | null
    patientId: number
    patientTenantId: number
    qrCode?: string
    accessLevel: 'full' | 'basic' | 'emergency' | 'none'
    accessType: 'qr_scan' | 'emergency_token' | 'direct_access'
    ipAddress?: string
    userAgent?: string
    accessedData?: Record<string, any>
    accessGranted: boolean
    denialReason?: string
  }) {
    return await this.create({
      ...data,
      accessedAt: DateTime.now()
    })
  }

  /**
   * Get access statistics for patient
   */
  static async getPatientAccessStats(patientId: number, days: number = 30) {
    const since = DateTime.now().minus({ days })
    
    const stats = await this.query()
      .where('patient_id', patientId)
      .where('accessed_at', '>=', since.toSQL())
      .groupBy('access_level', 'access_granted')
      .count('* as total')
      .select('access_level', 'access_granted')

    return stats.reduce((acc, stat) => {
      const key = `${stat.accessLevel}_${stat.accessGranted ? 'granted' : 'denied'}`
      acc[key] = Number(stat.$extras.total)
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Get recent cross-tenant accesses
   */
  static async getRecentCrossTenantAccesses(tenantId: number, limit: number = 50) {
    return await this.query()
      .where((query) => {
        query.where('scanner_tenant_id', '!=', tenantId)
          .orWhere('patient_tenant_id', '!=', tenantId)
      })
      .where('access_granted', true)
      .preload('scannerUser')
      .preload('patient')
      .orderBy('accessed_at', 'desc')
      .limit(limit)
  }
}