import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tenant from './tenant.js'
import Personnel from './personnel.js'
import Visite from './visite.js'

/**
 * Patient model for managing patient information
 */
export default class Patient extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tenantId: number

  @column()
  declare patientNumber: string

  @column()
  declare nationalId: string | null

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column.date()
  declare dateOfBirth: DateTime

  @column()
  declare gender: 'male' | 'female'

  @column()
  declare phone: string | null

  @column()
  declare email: string | null

  @column()
  declare address: string | null

  @column()
  declare city: string | null

  @column()
  declare region: string | null

  @column()
  declare emergencyContactName: string | null

  @column()
  declare emergencyContactPhone: string | null

  @column()
  declare emergencyContactRelation: string | null

  @column()
  declare bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null

  @column({
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value: string) => value ? JSON.parse(value) : null,
  })
  declare allergies: string[] | null

  @column({
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value: string) => value ? JSON.parse(value) : null,
  })
  declare medicalHistory: Record<string, any> | null

  @column({
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value: string) => value ? JSON.parse(value) : null,
  })
  declare currentMedications: string[] | null

  @column()
  declare assignedDoctorId: number | null

  @column()
  declare assignedMidwifeId: number | null

  @column()
  declare isActive: boolean

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

  @belongsTo(() => Personnel, {
    foreignKey: 'assignedDoctorId',
  })
  declare assignedDoctor: BelongsTo<typeof Personnel>

  @belongsTo(() => Personnel, {
    foreignKey: 'assignedMidwifeId',
  })
  declare assignedMidwife: BelongsTo<typeof Personnel>

  @hasMany(() => Visite)
  declare visites: HasMany<typeof Visite>


  // Auto-generate patient number before save
  @beforeSave()
  static async generatePatientNumber(patient: Patient) {
    if (patient.$isNew && !patient.patientNumber) {
      const count = await Patient.query()
        .where('tenant_id', patient.tenantId)
        .count('* as total')
      
      const patientCount = Number(count[0].$extras.total) + 1
      const year = new Date().getFullYear().toString().slice(-2)
      patient.patientNumber = `P${year}${patientCount.toString().padStart(6, '0')}`
    }
  }

  /**
   * Get full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  /**
   * Get age in years
   */
  get age(): number {
    return DateTime.now().diff(this.dateOfBirth, 'years').years
  }


  /**
   * Get recent visites
   */
  async getRecentVisites(limit: number = 10) {
    return await Visite.query()
      .where('patient_id', this.id)
      .preload('personnel', (query) => {
        query.preload('user')
        query.preload('typePersonnel')
      })
      .preload('typeVisite')
      .orderBy('scheduled_at', 'desc')
      .limit(limit)
  }

  /**
   * Get next scheduled visite
   */
  async getNextVisite(): Promise<Visite | null> {
    return await Visite.query()
      .where('patient_id', this.id)
      .where('status', 'scheduled')
      .where('scheduled_at', '>', DateTime.now().toSQL())
      .preload('personnel', (query) => {
        query.preload('user')
        query.preload('typePersonnel')
      })
      .preload('typeVisite')
      .orderBy('scheduled_at', 'asc')
      .first()
  }

  /**
   * Check if patient has specific allergy
   */
  hasAllergy(allergen: string): boolean {
    if (!this.allergies) return false
    return this.allergies.some(allergy => 
      allergy.toLowerCase().includes(allergen.toLowerCase())
    )
  }

  /**
   * Search patients in tenant
   */
  static async searchInTenant(
    tenantId: number, 
    searchTerm: string,
    options: {
      includeInactive?: boolean
      limit?: number
    } = {}
  ) {
    const { includeInactive = false, limit = 50 } = options
    
    const query = this.query()
      .where('tenant_id', tenantId)
      .where((subQuery) => {
        subQuery
          .whereILike('first_name', `%${searchTerm}%`)
          .orWhereILike('last_name', `%${searchTerm}%`)
          .orWhereILike('patient_number', `%${searchTerm}%`)
          .orWhereILike('phone', `%${searchTerm}%`)
      })
      .preload('assignedDoctor', (query) => {
        query.preload('user')
        query.preload('typePersonnel')
      })
      .preload('assignedMidwife', (query) => {
        query.preload('user')
        query.preload('typePersonnel')
      })
      .orderBy('last_name')
      .orderBy('first_name')
      .limit(limit)

    if (!includeInactive) {
      query.where('is_active', true)
    }

    return await query
  }

  /**
   * Soft delete patient
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    this.isActive = false
    await this.save()
  }
}