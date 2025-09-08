import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cross_tenant_access_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Qui a accédé
      table
        .integer('scanner_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('scanner_tenant_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      // À quoi/qui
      table
        .integer('patient_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('patients')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('patient_tenant_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      // Détails de l'accès
      table.string('qr_code', 100).nullable()
      table.enum('access_level', ['full', 'basic', 'emergency', 'none']).notNullable()
      table.enum('access_type', ['qr_scan', 'emergency_token', 'direct_access']).notNullable()
      
      // Contexte
      table.string('ip_address', 45).nullable()
      table.string('user_agent').nullable()
      table.json('accessed_data').nullable() // Quelles données ont été consultées
      
      // Résultat
      table.boolean('access_granted').notNullable()
      table.string('denial_reason').nullable()
      
      // Timestamps
      table.timestamp('accessed_at').notNullable().defaultTo(this.now())
      table.timestamps(true, true)
      
      // Index pour audit et performance (noms courts pour MySQL)
      table.index(['scanner_user_id', 'accessed_at'], 'idx_scanner_access')
      table.index(['patient_id', 'accessed_at'], 'idx_patient_access')
      table.index(['scanner_tenant_id', 'patient_tenant_id'], 'idx_cross_tenant')
      table.index(['access_level', 'access_granted'], 'idx_access_result')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}