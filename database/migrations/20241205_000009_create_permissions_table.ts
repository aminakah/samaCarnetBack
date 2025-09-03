import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Informations de base
      table.string('name', 100).notNullable().unique().index()
      table.string('display_name', 200).notNullable()
      table.text('description').nullable()
      
      // Classification fonctionnelle
      table.string('module', 50).notNullable().index().comment('Ex: patients, visites, personnel')
      table.string('action', 50).notNullable().index().comment('Ex: create, read, update, delete')
      
      // Niveaux de permission
      table.enum('scope', ['own', 'department', 'tenant', 'global']).defaultTo('own').comment('Portée de la permission')
      table.boolean('requires_supervision').notNullable().defaultTo(false)
      table.integer('min_level_required').nullable().comment('Niveau minimum du type_personnel requis')
      
      // Classification métier
      table.boolean('is_system').notNullable().defaultTo(false).comment('Permission système vs métier')
      table.boolean('is_medical').notNullable().defaultTo(false).comment('Permission médicale')
      table.boolean('is_sensitive').notNullable().defaultTo(false).comment('Données sensibles')
      table.boolean('requires_audit').notNullable().defaultTo(false).comment('Nécessite audit')
      
      // Contraintes de sécurité
      table.json('conditions').nullable().comment('Conditions supplémentaires JSON')
      table.json('metadata').nullable().comment('Métadonnées additionnelles')
      
      // Gestion
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamps(true, true)
      
      // Index composés pour performance
      table.index(['module', 'action'])
      table.index(['is_medical', 'is_active'])
      table.index(['scope', 'is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}