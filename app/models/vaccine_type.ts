import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, beforeSave, computed } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import VaccineSchedule from './vaccine_schedule.js'

/**
 * VaccineType model representing different types of vaccines
 * Includes WHO standards and national program information
 */
export default class VaccineType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Vaccine identification
  @column()
  declare name: string

  @column()
  declare code: string

  @column()
  declare description: string | null

  // Vaccine details
  @column()
  declare manufacturer: string | null

  @column()
  declare brandName: string | null

  @column()
  declare vaccineType: 'live' | 'inactivated' | 'subunit' | 'toxoid' | 'mRNA' | 'viral_vector'

  // Target population
  @column()
  declare targetGroup: 'infant' | 'child' | 'adolescent' | 'adult' | 'pregnant_women' | 'elderly' | 'all'

  @column()
  declare minAgeMonths: number | null

  @column()
  declare maxAgeMonths: number | null

  // Administration details
  @column()
  declare route: 'oral' | 'intramuscular' | 'subcutaneous' | 'intradermal' | 'intranasal'

  @column()
  declare site: string | null

  @column()
  declare doseVolume: number | null

  // Scheduling information
  @column()
  declare dosesRequired: number

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare scheduleIntervals: number[] | null

  @column()
  declare boosterIntervalMonths: number | null

  @column()
  declare requiresBooster: boolean

  // Storage and handling
  @column()
  declare storageTempMin: number | null

  @column()
  declare storageTempMax: number | null

  @column()
  declare shelfLifeMonths: number | null

  @column()
  declare storageInstructions: string | null

  // Safety information
  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare contraindications: string[] | null

  

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare precautions: string[] | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare sideEffects: string[] | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare adverseReactions: string[] | null

  // Disease prevention
  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare diseasesPrevented: string[]

  @column()
  declare efficacyRate: string | null

  @column()
  declare immunityDurationYears: number | null

  // WHO/National program
  @column()
  declare isWhoApproved: boolean

  @column()
  declare isNationalProgram: boolean

  @column()
  declare isMandatory: boolean

  @column()
  declare priorityLevel: number

  // Multi-language support
  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare nameTranslations: Record<string, string> | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare descriptionTranslations: Record<string, string> | null

  // Status and availability
  @column()
  declare status: 'active' | 'inactive' | 'discontinued' | 'under_review'

  @column.date()
  declare approvalDate: DateTime | null

  @column.date()
  declare discontinuationDate: DateTime | null

  // Sync and versioning
  @column()
  declare syncId: string

  @column()
  declare version: number

  @column.dateTime()
  declare lastSyncAt: DateTime | null

  @column()
  declare isSynced: boolean

  // Timestamps
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @hasMany(() => VaccineSchedule)
  declare schedules: HasMany<typeof VaccineSchedule>


  // Hooks
  @beforeSave()
  static async generateSyncId(vaccineType: VaccineType) {
    if (vaccineType.$isNew && !vaccineType.syncId) {
      vaccineType.syncId = uuidv4()
    }
  }

  @beforeSave()
  static async incrementVersion(vaccineType: VaccineType) {
    if (!vaccineType.$isNew && Object.keys(vaccineType.$dirty).length > 0) {
      vaccineType.version = (vaccineType.version || 1) + 1
      vaccineType.isSynced = false
      vaccineType.lastSyncAt = DateTime.now()
    }
  }

  // Computed properties
  @computed()
  get isActive(): boolean {
    return this.status === 'active' && !this.deletedAt
  }

  @computed()
  get isDiscontinued(): boolean {
    return this.status === 'discontinued' || 
           (this.discontinuationDate !== null && this.discontinuationDate <= DateTime.now())
  }

  @computed()
  get storageTemperatureRange(): string | null {
    if (!this.storageTempMin && !this.storageTempMax) return null
    if (this.storageTempMin && this.storageTempMax) {
      return `${this.storageTempMin}°C to ${this.storageTempMax}°C`
    }
    if (this.storageTempMin) return `Above ${this.storageTempMin}°C`
    if (this.storageTempMax) return `Below ${this.storageTempMax}°C`
    return null
  }

  /**
   * Get localized name
   */
  getLocalizedName(locale: string = 'fr'): string {
    if (this.nameTranslations && this.nameTranslations[locale]) {
      return this.nameTranslations[locale]
    }
    return this.name
  }

  /**
   * Get localized description
   */
  getLocalizedDescription(locale: string = 'fr'): string | null {
    if (this.descriptionTranslations && this.descriptionTranslations[locale]) {
      return this.descriptionTranslations[locale]
    }
    return this.description
  }

  /**
   * Check if vaccine is suitable for age
   */
  isSuitableForAge(ageInMonths: number): boolean {
    if (this.minAgeMonths && ageInMonths < this.minAgeMonths) return false
    if (this.maxAgeMonths && ageInMonths > this.maxAgeMonths) return false
    return true
  }

  /**
   * Check if vaccine is suitable for target group
   */
  isSuitableForTargetGroup(targetGroup: string): boolean {
    return this.targetGroup === 'all' || this.targetGroup === targetGroup
  }

  /**
   * Get next dose interval
   */
  getNextDoseInterval(doseNumber: number): number | null {
    if (!this.scheduleIntervals || doseNumber > this.scheduleIntervals.length) {
      return null
    }
    return this.scheduleIntervals[doseNumber - 1] || null
  }

  /**
   * Check if contraindicated for conditions
   */
  isContraindicated(conditions: string[]): boolean {
    if (!this.contraindications) return false
    return this.contraindications.some(contra => conditions.includes(contra))
  }

  /**
   * Get precautions for conditions
   */
  getPrecautionsFor(conditions: string[]): string[] {
    if (!this.precautions) return []
    return this.precautions.filter(precaution => 
      conditions.some(condition => precaution.toLowerCase().includes(condition.toLowerCase()))
    )
  }

  /**
   * Update translation
   */
  async updateTranslation(locale: string, field: 'name' | 'description', value: string): Promise<void> {
    const translationField = field === 'name' ? 'nameTranslations' : 'descriptionTranslations'
    const translations = this[translationField] || {}
    translations[locale] = value
    this[translationField] = translations
    await this.save()
  }

  /**
   * Mark as discontinued
   */
  async discontinue(reason?: string): Promise<void> {
    this.status = 'discontinued'
    this.discontinuationDate = DateTime.now()
    if (reason) {
      this.description = (this.description || '') + `\n\nDiscontinued: ${reason}`
    }
    await this.save()
  }

  /**
   * Get vaccine schedule template
   */
  getScheduleTemplate(): Record<string, any> {
    return {
      vaccineTypeId: this.id,
      dosesRequired: this.dosesRequired,
      intervals: this.scheduleIntervals,
      boosterInterval: this.boosterIntervalMonths,
      requiresBooster: this.requiresBooster,
      route: this.route,
      site: this.site,
      doseVolume: this.doseVolume,
      targetGroup: this.targetGroup,
      minAge: this.minAgeMonths,
      maxAge: this.maxAgeMonths,
    }
  }

  /**
   * Find vaccines for target group
   */
  static async findForTargetGroup(targetGroup: string) {
    return await VaccineType.query()
      .where('status', 'active')
      .where((query) => {
        query.where('target_group', targetGroup).orWhere('target_group', 'all')
      })
      .whereNull('deleted_at')
      .orderBy('priority_level', 'asc')
      .orderBy('name', 'asc')
  }

  /**
   * Find mandatory vaccines
   */
  static async findMandatory() {
    return await VaccineType.query()
      .where('status', 'active')
      .where('is_mandatory', true)
      .whereNull('deleted_at')
      .orderBy('priority_level', 'asc')
  }

  /**
   * Find national program vaccines
   */
  static async findNationalProgram() {
    return await VaccineType.query()
      .where('status', 'active')
      .where('is_national_program', true)
      .whereNull('deleted_at')
      .orderBy('priority_level', 'asc')
  }

  /**
   * Search vaccines by disease
   */
  static async findByDisease(disease: string) {
    return await VaccineType.query()
      .where('status', 'active')
      .whereJsonSuperset('diseases_prevented', [disease])
      .whereNull('deleted_at')
      .orderBy('priority_level', 'asc')
  }
}
