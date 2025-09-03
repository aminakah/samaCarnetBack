import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Visite from './visite.js'

/**
 * TypeVisite model for defining visit/consultation types
 */
export default class TypeVisite extends BaseModel {
  static table = 'type_visite'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare nomType: string

  @column()
  declare description: string | null

  @column()
  declare durationMinutes: number

  @column()
  declare requiresAppointment: boolean

  @column()
  declare isEmergency: boolean

  @column()
  declare requiresDoctor: boolean

  @column()
  declare requiresMidwife: boolean

  @column()
  declare requiresNurse: boolean

  @column({
    prepare: (value) => value ? JSON.stringify(value) : null,
    consume: (value: string) => value ? JSON.parse(value) : null,
  })
  declare allowedPersonnelTypes: number[] | null

  @column()
  declare isPrenatal: boolean

  @column()
  declare isPostnatal: boolean

  @column()
  declare isVaccination: boolean

  @column()
  declare minPregnancyWeek: number | null

  @column()
  declare maxPregnancyWeek: number | null

  @column()
  declare colorCode: string

  @column()
  declare icon: string

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @hasMany(() => Visite)
  declare visites: HasMany<typeof Visite>

  /**
   * Check if personnel type can perform this visit
   */
  canBePerformedBy(typePersonnelId: number): boolean {
    if (!this.allowedPersonnelTypes) return true
    return this.allowedPersonnelTypes.includes(typePersonnelId)
  }

  /**
   * Check if visit type is appropriate for pregnancy week
   */
  isValidForPregnancyWeek(pregnancyWeek: number): boolean {
    if (!this.isPrenatal && !this.isPostnatal) return true
    
    if (this.minPregnancyWeek && pregnancyWeek < this.minPregnancyWeek) return false
    if (this.maxPregnancyWeek && pregnancyWeek > this.maxPregnancyWeek) return false
    
    return true
  }

  /**
   * Get visit category
   */
  get category(): 'prenatal' | 'postnatal' | 'vaccination' | 'general' | 'emergency' {
    if (this.isEmergency) return 'emergency'
    if (this.isPrenatal) return 'prenatal'
    if (this.isPostnatal) return 'postnatal'
    if (this.isVaccination) return 'vaccination'
    return 'general'
  }

  /**
   * Get required personnel summary
   */
  get requiredPersonnelSummary(): string[] {
    const required = []
    if (this.requiresDoctor) required.push('Médecin')
    if (this.requiresMidwife) required.push('Sage-femme')
    if (this.requiresNurse) required.push('Infirmier/ère')
    return required
  }

  /**
   * Find visit types by category
   */
  static async findByCategory(category: 'prenatal' | 'postnatal' | 'vaccination' | 'emergency') {
    const query = this.query().where('is_active', true)
    
    switch (category) {
      case 'prenatal':
        query.where('is_prenatal', true)
        break
      case 'postnatal':
        query.where('is_postnatal', true)
        break
      case 'vaccination':
        query.where('is_vaccination', true)
        break
      case 'emergency':
        query.where('is_emergency', true)
        break
    }

    return await query.orderBy('sort_order').orderBy('name')
  }

  /**
   * Find visit types available for personnel type
   */
  static async findForPersonnelType(typePersonnelId: number) {
    return await this.query()
      .where('is_active', true)
      .where((query) => {
        query
          .whereNull('allowed_personnel_types')
          .orWhereRaw('JSON_CONTAINS(allowed_personnel_types, ?)', [typePersonnelId.toString()])
      })
      .orderBy('sort_order')
      .orderBy('name')
  }

  /**
   * Find appropriate visit types for pregnancy week
   */
  static async findForPregnancyWeek(pregnancyWeek: number, isPostnatal: boolean = false) {
    const query = this.query().where('is_active', true)
    
    if (isPostnatal) {
      query.where('is_postnatal', true)
    } else {
      query.where('is_prenatal', true)
      query.where((subQuery) => {
        subQuery
          .whereNull('min_pregnancy_week')
          .orWhere('min_pregnancy_week', '<=', pregnancyWeek)
      })
      query.where((subQuery) => {
        subQuery
          .whereNull('max_pregnancy_week')
          .orWhere('max_pregnancy_week', '>=', pregnancyWeek)
      })
    }

    return await query.orderBy('sort_order').orderBy('name')
  }

  /**
   * Get emergency visit types
   */
  static async getEmergencyTypes() {
    return await this.query()
      .where('is_emergency', true)
      .where('is_active', true)
      .orderBy('sort_order')
      .orderBy('name')
  }

  /**
   * Get vaccination visit types
   */
  static async getVaccinationTypes() {
    return await this.query()
      .where('is_vaccination', true)
      .where('is_active', true)
      .orderBy('sort_order')
      .orderBy('name')
  }

  /**
   * Create visit type with validation
   */
  static async createVisitType(data: {
    name: string
    nomType: string
    description?: string
    durationMinutes?: number
    requiresAppointment?: boolean
    isEmergency?: boolean
    requiresDoctor?: boolean
    requiresMidwife?: boolean
    requiresNurse?: boolean
    allowedPersonnelTypes?: number[]
    isPrenatal?: boolean
    isPostnatal?: boolean
    isVaccination?: boolean
    minPregnancyWeek?: number
    maxPregnancyWeek?: number
    colorCode?: string
    icon?: string
    sortOrder?: number
  }) {
    // Validate name uniqueness
    const existing = await this.findBy('name', data.name)
    if (existing) {
      throw new Error(`Visit type ${data.name} already exists`)
    }

    // Set defaults
    const visitType = await this.create({
      ...data,
      durationMinutes: data.durationMinutes || 30,
      requiresAppointment: data.requiresAppointment ?? true,
      isEmergency: data.isEmergency || false,
      requiresDoctor: data.requiresDoctor || false,
      requiresMidwife: data.requiresMidwife || false,
      requiresNurse: data.requiresNurse || false,
      isPrenatal: data.isPrenatal || false,
      isPostnatal: data.isPostnatal || false,
      isVaccination: data.isVaccination || false,
      colorCode: data.colorCode || '#2E7D32',
      icon: data.icon || 'fa-calendar',
      sortOrder: data.sortOrder || 1,
      isActive: true
    })

    return visitType
  }
}