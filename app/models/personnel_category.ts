import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import TypePersonnel from './type_personnel.js'

/**
 * Personnel Category model for organizing staff types
 */
export default class PersonnelCategory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare nomCategory: string

  @column()
  declare description: string | null

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
  @hasMany(() => PersonnelCategory)
  declare subcategories: HasMany<typeof PersonnelCategory>

  @hasMany(() => TypePersonnel)
  declare typePersonnels: HasMany<typeof TypePersonnel>

  /**
   * Get active subcategories
   */
  async getActiveSubcategories() {
    return await PersonnelCategory.query()
      .where('category_id', this.id)
      .where('is_active', true)
      .orderBy('sort_order')
  }

  /**
   * Get all personnel types under this category
   */
  async getAllPersonnelTypes() {
    return await TypePersonnel.query()
      .where('category_id', this.id)
      .where('is_active', true)
      .preload('subcategory')
      .orderBy('level')
      .orderBy('sort_order')
  }
}