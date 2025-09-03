import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import VaccineSchedule from './vaccine_schedule.js'
import SyncLog from './sync_log.js'
import User from './user.js'


/**
 * Tenant model representing individual healthcare organizations/clinics
 * Supports multi-tenancy with subdomain and domain-based isolation
 */
export default class Tenant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Tenant identification
  @column()
  declare name: string

  @column()
  declare subdomain: string

  @column()
  declare domain: string | null

  // Contact information
  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare address: string | null

  // Configuration and subscription
  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare settings: Record<string, any> | null

  @column()
  declare status: 'active' | 'inactive' | 'suspended'

  @column()
  declare subscriptionPlan: 'basic' | 'premium' | 'enterprise'

  @column.dateTime()
  declare subscriptionExpiresAt: DateTime | null

  // Multi-database tenancy support
  @column()
  declare databaseName: string | null

  @column()
  declare databaseHost: string | null

  @column()
  declare databasePort: number | null

  // Timestamps
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @hasMany(() => User
)
  declare users: HasMany<typeof User>

  @hasMany(() => VaccineSchedule)
  declare vaccineSchedules: HasMany<typeof VaccineSchedule>

  @hasMany(() => SyncLog)
  declare syncLogs: HasMany<typeof SyncLog>

  /**
   * Get tenant by subdomain
   */
  static async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return await Tenant.query()
      .where('subdomain', subdomain)
      .where('status', 'active')
      .first()
  }

  /**
   * Get tenant by domain
   */
  static async findByDomain(domain: string): Promise<Tenant | null> {
    return await Tenant.query()
      .where('domain', domain)
      .where('status', 'active')
      .first()
  }

  /**
   * Check if tenant is active and subscription is valid
   */
  get isActive(): boolean {
    if (this.status !== 'active') return false
    if (!this.subscriptionExpiresAt) return true
    return this.subscriptionExpiresAt > DateTime.now()
  }

  /**
   * Get tenant settings with defaults
   */
  // getSetting(key: string, defaultValue: any = null): any {
  //   if (!this.settings) return defaultValue
  //   return this.settings[key] ?? defaultValue
  // }

  /**
   * Update tenant setting
   */
  // async updateSetting(key: string, value: any): Promise<void> {
  //   const settings = this.settings || {}
  //   settings[key] = value
  //   this.settings = settings
  //   await this.save()
  // }

  

  /**
   * Soft delete tenant and related data
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    this.status = 'inactive'
    await this.save()
  }
}
