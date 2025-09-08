import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'super_admins'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()
      
      table.string('access_level', 50).notNullable().defaultTo('full')
      table.json('permissions_override').nullable()
      table.text('notes').nullable()
      
      table.timestamps(true, true)
      table.timestamp('deleted_at').nullable()
      
      table.unique(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}