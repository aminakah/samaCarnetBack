import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'personnel_subcategories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('category_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('personnel_categories')
        .onDelete('CASCADE')
        .index()
      
      table.string('name', 100).notNullable().index()
      table.string('nom_subcategory', 200).notNullable()
      table.text('description').nullable()
      table.boolean('requires_specialization').notNullable().defaultTo(false)
      table.integer('sort_order').notNullable().defaultTo(1)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamps(true, true)

      // Index composé pour unicité par catégorie
      table.unique(['category_id', 'name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}