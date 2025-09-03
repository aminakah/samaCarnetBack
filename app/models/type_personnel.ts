import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import PersonnelCategory from './personnel_category.js'
import PersonnelSubcategory from './personnel_subcategory.js'
import Personnel from './personnel.js'
import Role from './role.js'

/**
 * Type Personnel model defining specific staff roles
 */
export default class TypePersonnel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare categoryId: number

  @column()
  declare subcategoryId: number | null

  @column()
  declare name: string

  @column()
  declare nomType: string

  @column()
  declare description: string | null

  @column()
  declare level: number

  // Medical permissions
  @column()
  declare canPrescribe: boolean

  @column()
  declare canSupervise: boolean

  @column()
  declare canValidateActs: boolean

  @column()
  declare requiresLicense: boolean

  @column()
  declare minExperienceYears: number

  // Classification flags
  @column()
  declare isMedicalStaff: boolean

  @column()
  declare isAdministrative: boolean

  @column()
  declare isTechnical: boolean

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => PersonnelCategory, {
    foreignKey: 'categoryId'
  })
  declare category: BelongsTo<typeof PersonnelCategory>

  @belongsTo(() => PersonnelSubcategory, {
    foreignKey: 'subcategoryId'
  })
  declare subcategory: BelongsTo<typeof PersonnelSubcategory>

  @hasMany(() => Personnel)
  declare personnel: HasMany<typeof Personnel>

  @hasMany(() => Role)
  declare roles: HasMany<typeof Role>

  /**
   * Get full hierarchical path
   */
  async getFullPath(): Promise<string> {
    await this.load('category')
    await this.load('subcategory')
    
    if (this.subcategory) {
      return `${this.category.nomCategory} > ${this.subcategory.nomSubcategory} > ${this.nomType}`
    }
    return `${this.category.nomCategory} > ${this.nomType}`
  }

  /**
   * Check if this type has medical permissions
   */
  get hasMedicalPermissions(): boolean {
    return this.canPrescribe || this.canValidateActs || this.isMedicalStaff
  }

  /**
   * Check if this type can supervise others
   */
  get isSupervisionRole(): boolean {
    return this.canSupervise && this.level >= 3
  }

  /**
   * Get level description
   */
  get levelDescription(): string {
    switch (this.level) {
      case 1: return 'Junior'
      case 2: return 'Confirmé'
      case 3: return 'Senior'
      case 4: return 'Chef/Directeur'
      default: return 'Non défini'
    }
  }

  /**
   * Find personnel types by capabilities
   */
  static async findByCapabilities(capabilities: {
    canPrescribe?: boolean
    canSupervise?: boolean
    isMedicalStaff?: boolean
    minLevel?: number
  }) {
    const query = this.query().where('is_active', true)
    
    if (capabilities.canPrescribe !== undefined) {
      query.where('can_prescribe', capabilities.canPrescribe)
    }
    if (capabilities.canSupervise !== undefined) {
      query.where('can_supervise', capabilities.canSupervise)
    }
    if (capabilities.isMedicalStaff !== undefined) {
      query.where('is_medical_staff', capabilities.isMedicalStaff)
    }
    if (capabilities.minLevel !== undefined) {
      query.where('level', '>=', capabilities.minLevel)
    }

    return query
      .preload('category')
      .preload('subcategory')
      .orderBy('level', 'desc')
      .orderBy('sort_order')
  }
}