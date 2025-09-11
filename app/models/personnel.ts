import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tenant from './tenant.js'
import User from './user.js'
import TypePersonnel from './type_personnel.js'
import Patient from './patient.js'
import Visite from './visite.js'
import VisitHistory from './visit_history.js'

/**
 * Personnel model linking users to their professional roles
 */
export default class Personnel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tenantId: number

  @column()
  declare userId: number

  @column()
  declare typePersonnelId: number

  @column()
  declare licenseNumber: string | null

  // @column({
  //   prepare: (value) => value ? JSON.stringify(value) : null,
  //   consume: (value: string) => value ? JSON.parse(value) : null,
  // })
  // declare specialties: string[] | null

  @column()
  declare department: string | null

  @column()
  declare service: string | null

  @column()
  declare bio: string | null

  @column.date()
  declare hireDate: DateTime | null

  @column.date()
  declare endDate: DateTime | null

  @column()
  declare contractType: 'CDI' | 'CDD' | 'VACATION' | 'STAGE'

  @column()
  declare isOnDuty: boolean

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TypePersonnel)
  declare typePersonnel: BelongsTo<typeof TypePersonnel>



  @hasMany(() => Visite)
  declare visites: HasMany<typeof Visite>

  @hasMany(() => Visite, {
    foreignKey: 'supervisedBy',
  })
  declare supervisedVisites: HasMany<typeof Visite>

  @hasMany(() => Visite, {
    foreignKey: 'validatedBy',
  })
  declare validatedVisites: HasMany<typeof Visite>

  @hasMany(() => VisitHistory, {
    foreignKey: 'modifiedBy'
  })
  declare visitHistories: HasMany<typeof VisitHistory>

  /**
   * Get full name from related user
   */
  async getFullName(): Promise<string> {
    await this.load('user')
    return this.user.fullName
  }

  /**
   * Get professional title
   */
  async getProfessionalTitle(): Promise<string> {
    await this.load('typePersonnel')
    await this.typePersonnel.load('category')
    await this.typePersonnel.load('subcategory')
    
    return this.typePersonnel.nomType
  }

  /**
   * Check if personnel can prescribe
   */
  async canPrescribe(): Promise<boolean> {
    await this.load('typePersonnel')
    return this.typePersonnel.canPrescribe
  }

  /**
   * Check if personnel can supervise
   */
  async canSupervise(): Promise<boolean> {
    await this.load('typePersonnel')
    return this.typePersonnel.canSupervise
  }

  /**
   * Get current workload (number of active assignments)
   */
  async getCurrentWorkload(): Promise<{
    assignedPatients: number
    todayVisites: number
    pendingVisites: number
  }> {
    const [assignedPatients, todayVisites, pendingVisites] = await Promise.all([
      // Count assigned patients - simplified since patients don't have assigned personnel in new structure
      Promise.resolve([{ $extras: { total: 0 } }]),
      
      // Count today's visites
      Visite.query()
        .where('personnel_id', this.id)
        .whereBetween('scheduled_at', [
          DateTime.now().startOf('day').toSQL(),
          DateTime.now().endOf('day').toSQL()
        ])
        .count('* as total'),
      
      // Count pending visites
      Visite.query()
        .where('personnel_id', this.id)
        .where('status', 'scheduled')
        .count('* as total')
    ])

    return {
      assignedPatients: Number(assignedPatients[0].$extras.total),
      todayVisites: Number(todayVisites[0].$extras.total),
      pendingVisites: Number(pendingVisites[0].$extras.total)
    }
  }

  /**
   * Find available personnel for a specific date/time
   */
  static async findAvailable(
    tenantId: number,
    dateTime: DateTime,
    typePersonnelId?: number
  ) {
    const query = this.query()
      .where('tenant_id', tenantId)
      .where('is_on_duty', true)
      .whereNull('deleted_at')
      .preload('user')
      .preload('typePersonnel')

    if (typePersonnelId) {
      query.where('type_personnel_id', typePersonnelId)
    }

    // Exclude personnel who have conflicting appointments
    query.whereNotExists((subquery) => {
      subquery
        .from('visite')
        .whereColumn('visite.personnel_id', 'personnel.id')
        .where('status', 'scheduled')
        .whereBetween('scheduled_at', [
          dateTime.minus({ minutes: 30 }).toSQL() || '',
          dateTime.plus({ minutes: 30 }).toSQL() || ''
        ])
    })

    return await query
  }

  /**
   * Check if personnel has specific role
   */
  async hasRole(roleName: string): Promise<boolean> {
    await this.load('user')
    return await this.user.hasRole(roleName)
  }

  /**
   * Check if personnel has specific permission
   */
  async hasPermission(permissionName: string): Promise<boolean> {
    await this.load('user')
    return await this.user.hasPermission(permissionName)
  }

  /**
   * Check if personnel is admin
   */
  async isAdmin(): Promise<boolean> {
    await this.load('user')
    return await this.user.isAdmin()
  }

  /**
   * Check if personnel is medical staff
   */
  async isMedicalStaff(): Promise<boolean> {
    await this.load('user')
    return await this.user.isMedicalStaff()
  }

  /**
   * Soft delete personnel
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    await this.save()
  }
}