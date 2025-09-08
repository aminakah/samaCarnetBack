import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'visit_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      table
        .integer('visit_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('visite')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('modified_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('personnel')
        .onDelete('RESTRICT')
        .index()
      
      table.enum('action', ['created', 'updated', 'cancelled', 'completed', 'rescheduled']).notNullable()
      table.json('changes').nullable().comment('JSON of field changes')
      table.text('reason').nullable()
      table.dateTime('action_date').notNullable()
      
      table.timestamps(true, true)
      
      table.index(['visit_id', 'action_date'])
      // table.index(['modified_by'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}