import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('patient_number', 50).notNullable().index()
      table.string('national_id', 50).nullable().index()
      table.string('city', 100).nullable()
      table.string('region', 100).nullable()
      
      // Contact d'urgence
      table.string('emergency_contact_name', 100).nullable()
      table.string('emergency_contact_phone', 20).nullable()
      table.string('emergency_contact_relation', 50).nullable()
      
      // Informations médicales
      table.enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).nullable()
      table.json('allergies').nullable()
      table.json('medical_history').nullable()
      table.json('current_medications').nullable()
      
      // Statut et gestion
      table.text('notes').nullable()
      
      // Timestamps
      table.timestamps(true, true)
      table.timestamp('deleted_at').nullable()
      
      // Index composés
      table.unique([ 'patient_number','national_id'])
     
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}