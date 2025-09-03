import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'type_personnels'

  async up() {
    // Créer la nouvelle table avec la structure complète
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Relations
      table
        .integer('category_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('personnel_categories')
        .onDelete('RESTRICT')
        .index()
      
      table
        .integer('subcategory_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('personnel_subcategories')
        .onDelete('SET NULL')
        .index()
      
      // Informations de base
      table.string('name', 100).notNullable().unique().index()
      table.string('nom_type', 200).notNullable()
      table.text('description').nullable()
      table.integer('level').notNullable().defaultTo(1).comment('1=Junior, 2=Senior, 3=Chef, 4=Directeur')
      
      // Permissions métier
      table.boolean('can_prescribe').notNullable().defaultTo(false)
      table.boolean('can_supervise').notNullable().defaultTo(false)
      table.boolean('can_validate_acts').notNullable().defaultTo(false)
      table.boolean('requires_license').notNullable().defaultTo(false)
      table.integer('min_experience_years').notNullable().defaultTo(0)
      
      // Classification
      table.boolean('is_medical_staff').notNullable().defaultTo(false)
      table.boolean('is_administrative').notNullable().defaultTo(false)
      table.boolean('is_technical').notNullable().defaultTo(false)
      
      // UI/UX et gestion
      table.integer('sort_order').notNullable().defaultTo(1)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamps(true, true)

      // Index composés pour performance
      table.index(['category_id', 'level'])
      table.index(['is_medical_staff', 'is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}