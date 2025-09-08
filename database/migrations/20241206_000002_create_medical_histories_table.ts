import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medical_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      table
        .integer('patient_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('patients')
        .onDelete('CASCADE')
        .index()
      
      table.enum('type', ['allergy', 'condition', 'surgery', 'medication', 'family_history']).notNullable()
      table.string('title', 200).notNullable()
      table.text('description').nullable()
      table.date('date_recorded').nullable()
      table.enum('severity', ['low', 'medium', 'high', 'critical']).nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      
      table.timestamps(true, true)
      table.timestamp('deleted_at').nullable()
      
      table.index(['patient_id', 'type'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}