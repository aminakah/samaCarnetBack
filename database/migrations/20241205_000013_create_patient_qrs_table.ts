import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patient_qrs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Relation patient
      table
        .integer('patient_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('patients')
        .onDelete('CASCADE')
        .index()
      
      // QR Code data
      table.string('qr_code', 100).notNullable().unique().index()
      table.text('qr_code_image').notNullable() // Base64 image
      
      // Status et sécurité
      table.boolean('is_active').notNullable().defaultTo(true)
      table.dateTime('expires_at').nullable()
      
      // Statistiques d'utilisation
      table.dateTime('last_scanned_at').nullable()
      table.integer('scan_count').notNullable().defaultTo(0)
      
      // Timestamps
      table.timestamps(true, true)
      
      // Index
      table.index(['is_active'])
      table.index(['expires_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}