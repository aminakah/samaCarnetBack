import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'type_visite'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Informations de base
      table.string('name', 100).notNullable().unique().index()
      table.string('nom_type', 200).notNullable()
      table.text('description').nullable()
      
      // Configuration visite
      table.integer('duration_minutes').notNullable().defaultTo(30)
      table.boolean('requires_appointment').notNullable().defaultTo(true)
      table.boolean('is_emergency').notNullable().defaultTo(false)
      
      // Contraintes personnel
      table.boolean('requires_doctor').notNullable().defaultTo(false)
      table.boolean('requires_midwife').notNullable().defaultTo(false)
      table.boolean('requires_nurse').notNullable().defaultTo(false)
      table.json('allowed_personnel_types').nullable().comment('Array of type_personnel IDs')
      
      // Configuration grossesse
      table.boolean('is_prenatal').notNullable().defaultTo(false)
      table.boolean('is_postnatal').notNullable().defaultTo(false)
      table.boolean('is_vaccination').notNullable().defaultTo(false)
      table.integer('min_pregnancy_week').nullable()
      table.integer('max_pregnancy_week').nullable()
      
      // UI/UX
      table.string('color_code', 7).nullable().defaultTo('#2E7D32')
      table.string('icon', 50).nullable().defaultTo('fa-calendar')
      table.integer('sort_order').notNullable().defaultTo(1)
      
      // Gestion
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamps(true, true)

      // Index composés
      table.index(['is_prenatal', 'is_active'])
      table.index(['is_emergency', 'is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}