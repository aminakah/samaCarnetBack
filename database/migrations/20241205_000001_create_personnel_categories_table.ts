import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'personnel_categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 100).notNullable().unique().index()
      table.string('nom_category', 200).notNullable()
      table.text('description').nullable()
      table.string('color_code', 7).nullable().defaultTo('#2E7D32')
      table.string('icon', 50).nullable().defaultTo('fa-user')
      table.integer('sort_order').notNullable().defaultTo(1)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}