import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Relation tenant
      table
        .integer('tenant_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      // Identifiants patient
      table.string('patient_number', 50).notNullable().index()
      table.string('national_id', 50).nullable().index()
      
      // Informations personnelles
      table.string('first_name', 100).notNullable()
      table.string('last_name', 100).notNullable()
      table.date('date_of_birth').notNullable()
      table.enum('gender', ['male', 'female']).notNullable()
      
      // Contact
      table.string('phone', 20).nullable()
      table.string('email', 100).nullable()
      table.text('address').nullable()
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
      
      // Assignations médicales
      table
        .integer('assigned_doctor_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('personnel')
        .onDelete('SET NULL')
        .index()
      
      table
        .integer('assigned_midwife_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('personnel')
        .onDelete('SET NULL')
        .index()
      
      // Statut et gestion
      table.boolean('is_active').notNullable().defaultTo(true)
      table.text('notes').nullable()
      
      // Timestamps
      table.timestamps(true, true)
      table.timestamp('deleted_at').nullable()
      
      // Index composés
      table.unique(['tenant_id', 'patient_number'])
      table.index(['tenant_id', 'is_active'])
      table.index(['first_name', 'last_name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}