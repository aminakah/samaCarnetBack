import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeSave, hasManyThrough } from '@adonisjs/lucid/orm'
import type { HasMany, HasManyThrough } from '@adonisjs/lucid/types/relations'
import Visite from './visite.js'
import MedicalHistory from './medical_history.js'
import VisitHistory from './visit_history.js'

/**
 * Patient model for managing patient information
 */
export default class Patient extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare patientNumber: string

  @column()
  declare nationalId: string | null

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
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships

  @hasMany(() => Visite)
  declare visites: HasMany<typeof Visite>

  @hasMany(() => MedicalHistory)
  declare medicalHistories: HasMany<typeof MedicalHistory>

  // @hasManyThrough([
  //   () => VisitHistory,
  //   () => Visite
  // ])
  // declare visitHistories: HasManyThrough<[typeof VisitHistory, typeof Visite]>


  // Auto-generate patient number before save
  @beforeSave()
  static async generatePatientNumber(patient: Patient) {
    if (patient.$isNew && !patient.patientNumber) {
      const count = await Patient.query().count('* as total')
      
      const patientCount = Number(count[0].$extras.total) + 1
      const year = new Date().getFullYear().toString().slice(-2)
      patient.patientNumber = `P${year}${patientCount.toString().padStart(6, '0')}`
    }
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
   * Search patients
   */
  static async search(
    searchTerm: string,
    options: {
      limit?: number
    } = {}
  ) {
    const { limit = 50 } = options
    
    return await this.query()
      .where((subQuery) => {
        subQuery
          .whereILike('patient_number', `%${searchTerm}%`)
          .orWhereILike('national_id', `%${searchTerm}%`)
      })
      .orderBy('patient_number')
      .limit(limit)
  }

  /**
   * Soft delete patient
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    await this.save()
  }
}