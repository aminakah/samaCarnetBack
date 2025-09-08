import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'personnel'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Relations de base
      table
        .integer('tenant_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('type_personnel_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('type_personnels')
        .onDelete('RESTRICT')
        .index()
      
      // Informations professionnelles
      table.string('license_number', 100).nullable().index()
      table.json('specialties').nullable().comment('Array of specialties')
      table.string('department', 100).nullable()
      table.string('service', 100).nullable()

      table.text('bio').nullable()
      
      // Informations contractuelles
      table.date('hire_date').nullable()
      table.date('end_date').nullable()
      table.enum('contract_type', ['CDI', 'CDD', 'VACATION', 'STAGE']).defaultTo('CDI')
      
      table.boolean('is_on_duty').notNullable().defaultTo(false)
      table.text('notes').nullable()
      
      // Timestamps
      table.timestamps(true, true)
      table.timestamp('deleted_at').nullable()
      
      // Index composés
      table.unique(['tenant_id', 'user_id'])
      table.index(['tenant_id', 'type_personnel_id'])
      table.index(['is_on_duty'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}