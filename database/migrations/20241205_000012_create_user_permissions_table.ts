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
        .integer('tenant_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tenants')
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
      
      // Type d'attribution (direct ou délégation)
      table
        .enum('grant_type', ['direct', 'delegation', 'temporary', 'emergency'])
        .defaultTo('direct')
        .comment('Type d attribution de permission')
      
      // Conditions spécifiques
      table.json('conditions').nullable().comment('Conditions spécifiques JSON')
      table.enum('scope_override', ['own', 'department', 'tenant', 'global']).nullable()
      
      // Gestion temporelle
      table.dateTime('granted_at').notNullable().defaultTo(this.now())
      table.dateTime('expires_at').nullable()
      table.dateTime('last_used_at').nullable()
      
      // Traçabilité
      table
        .integer('granted_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      
      table.text('grant_reason').notNullable().comment('Justification obligatoire')
      
      // Délégation (si applicable)
      table
        .integer('delegated_from')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .comment('Utilisateur qui délègue')
      
      table.dateTime('delegation_start').nullable()
      table.dateTime('delegation_end').nullable()
      
      // Status et audit
      table.boolean('is_active').notNullable().defaultTo(true)
      table.boolean('requires_approval').notNullable().defaultTo(false)
      table.dateTime('approved_at').nullable()
      table
        .integer('approved_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      
      // Timestamps
      table.timestamps(true, true)
      
      // Contraintes et index
      table.unique(['user_id', 'tenant_id', 'permission_id'])
      table.index(['expires_at'])
      table.index(['grant_type', 'is_active'])
      table.index(['delegated_from', 'delegation_end'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}