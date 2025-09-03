import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Relations principales
      table
        .integer('role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roles')
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
      
      // Contexte tenant (null pour permissions globales)
      table
        .integer('tenant_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      // Conditions spécifiques
      table.json('conditions').nullable().comment('Conditions spécifiques JSON')
      table.enum('scope_override', ['own', 'department', 'tenant', 'global']).nullable()
      
      // Contraintes temporelles
      table.dateTime('valid_from').nullable()
      table.dateTime('valid_until').nullable()
      
      // Traçabilité
      table
        .integer('granted_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      
      table.dateTime('granted_at').notNullable().defaultTo(this.now())
      table.text('grant_reason').nullable()
      
      // Status
      table.boolean('is_active').notNullable().defaultTo(true)
      table.boolean('is_inherited').notNullable().defaultTo(false).comment('Hérité d un rôle parent')
      
      // Timestamps
      table.timestamps(true, true)
      
      // Contraintes et index
      table.unique(['role_id', 'permission_id', 'tenant_id'])
      table.index(['tenant_id', 'is_active'])
      table.index(['valid_until'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}