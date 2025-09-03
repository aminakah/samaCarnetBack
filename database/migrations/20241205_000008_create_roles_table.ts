import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Relation tenant (null pour rôles système globaux)
      table
        .integer('tenant_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      // Informations de base
      table.string('name', 100).notNullable().index()
      table.string('display_name', 200).notNullable()
      table.text('description').nullable()
      
      // Hiérarchie et classification
      table.integer('level').notNullable().defaultTo(1).comment('Niveau hiérarchique')
      table.boolean('is_system').notNullable().defaultTo(false).comment('Rôle système vs tenant')
      table.boolean('is_medical').notNullable().defaultTo(false).comment('Rôle médical')
      table.boolean('is_administrative').notNullable().defaultTo(false).comment('Rôle administratif')
      
      // Relation avec type_personnel (optionnel)
      table
        .integer('type_personnel_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('type_personnels')
        .onDelete('SET NULL')
        .index()
      
      // Gestion et métadonnées
      table.json('metadata').nullable().comment('Métadonnées additionnelles')
      table.integer('max_users').nullable().comment('Limite utilisateurs pour ce rôle')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.boolean('is_assignable').notNullable().defaultTo(true)
      
      // Timestamps
      table.timestamps(true, true)
      
      // Index composés
      table.unique(['tenant_id', 'name'])
      table.index(['is_system', 'is_active'])
      table.index(['level', 'is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}