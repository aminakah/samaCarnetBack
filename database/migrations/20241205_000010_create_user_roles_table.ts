import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_roles'

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
        .integer('tenant_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roles')
        .onDelete('CASCADE')
        .index()
      
      // Contexte organisationnel (optionnel)
      table.string('department', 100).nullable()
      table.string('service', 100).nullable()
      table.json('context').nullable().comment('Contexte additionnel JSON')
      
      // Gestion temporelle
      table.dateTime('assigned_at').notNullable().defaultTo(this.now())
      table.dateTime('expires_at').nullable()
      table.dateTime('last_used_at').nullable()
      
      // Traçabilité
      table
        .integer('assigned_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      
      table.text('assignment_reason').nullable()
      
      // Status
      table.boolean('is_active').notNullable().defaultTo(true)
      table.boolean('is_primary').notNullable().defaultTo(false).comment('Rôle principal de l utilisateur')
      
      // Timestamps
      table.timestamps(true, true)
      
      // Contraintes et index
      table.unique(['user_id', 'tenant_id', 'role_id'])
      table.index(['tenant_id', 'is_active'])
      table.index(['user_id', 'is_active'])
      table.index(['expires_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}