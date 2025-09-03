import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import PersonnelCategory from './personnel_category.js'
import TypePersonnel from './type_personnel.js'

/**
 * Personnel Subcategory model for detailed staff classification
 */
export default class PersonnelSubcategory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare categoryId: number

  @column()
  declare name: string

  @column()
  declare nomSubcategory: string

  @column()
  declare description: string | null

  @column()
  declare requiresSpecialization: boolean

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => PersonnelCategory)
  declare category: BelongsTo<typeof PersonnelCategory>

  @hasMany(() => TypePersonnel)
  declare typePersonnels: HasMany<typeof TypePersonnel>

  /**
   * Get full category path
   */
  async getFullPath(): Promise<string> {
    await this.load('category')
    return `${this.category.nomCategory} > ${this.nomSubcategory}`
  }

  /**
   * Get active personnel types in this subcategory
   */
  async getActivePersonnelTypes() {
    return await TypePersonnel.query()
      .where('subcategory_id', this.id)
      .where('is_active', true)
      .orderBy('level')
      .orderBy('sort_order')
  }
}