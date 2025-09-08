import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Relations principales
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('permission_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('permissions')
        .onDelete('CASCADE')
        .index()
      
      // Contexte tenant
      table
        .integer('tenant_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      // Traçabilité
      table
        .integer('granted_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      
      table.dateTime('granted_at').notNullable().defaultTo(this.now())
      table.dateTime('expires_at').nullable()
      table.text('grant_reason').nullable()
      
      // Surcharge de scope
      table.enum('scope_override', ['own', 'department', 'tenant', 'global']).nullable()
      table.json('conditions').nullable()
      
      // Status
      table.boolean('is_active').notNullable().defaultTo(true)
      
      // Timestamps
      table.timestamps(true, true)
      
      // Contraintes
      table.unique(['user_id', 'permission_id', 'tenant_id'])
      table.index(['tenant_id', 'is_active'])
      table.index(['expires_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}