import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 100).notNullable().index()
      table.string('display_name', 200).notNullable()
      table.text('description').nullable()
      table.timestamps(true, true)
      
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}