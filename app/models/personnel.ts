import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tenant from './tenant.js'
import User from './user.js'
import TypePersonnel from './type_personnel.js'
import Patient from './patient.js'
import Visite from './visite.js'

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

  @column({
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value: string) => JSON.parse(value),
  })
  declare specialties: string[] | null

  @column()
  declare department: string | null

  @column()
  declare service: string | null

  @column.date()
  declare hireDate: DateTime | null

  @column.date()
  declare endDate: DateTime | null

  @column()
  declare contractType: 'CDI' | 'CDD' | 'VACATION' | 'STAGE'

  @column()
  declare isActive: boolean

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

  @hasMany(() => Patient, {
    foreignKey: 'assignedDoctorId',
  })
  declare assignedPatientsAsDoctor: HasMany<typeof Patient>

  @hasMany(() => Patient, {
    foreignKey: 'assignedMidwifeId',
  })
  declare assignedPatientsAsMidwife: HasMany<typeof Patient>

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
      // Count assigned patients
      Patient.query()
        .where((query) => {
          query.where('assigned_doctor_id', this.id)
            .orWhere('assigned_midwife_id', this.id)
        })
        .where('is_active', true)
        .count('* as total'),
      
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
      .where('is_active', true)
      .where('is_on_duty', true)
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
   * Soft delete personnel
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    this.isActive = false
    await this.save()
  }
}