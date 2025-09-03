import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'visite'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Relations de base
      table
        .integer('tenant_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('patient_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('patients')
        .onDelete('CASCADE')
        .index()
      
      table
        .integer('personnel_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('personnel')
        .onDelete('RESTRICT')
        .index()
      
      table
        .integer('type_visite_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('type_visite')
        .onDelete('RESTRICT')
        .index()
      
      // Lien vers grossesse (optionnel)
      table
        .integer('pregnancy_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('patients')
        .onDelete('SET NULL')
        .index()
      
      // Planning et timing
      table.dateTime('scheduled_at').nullable()
      table.dateTime('started_at').nullable()
      table.dateTime('ended_at').nullable()
      table.integer('duration_minutes').nullable()
      
      // Statut de la visite
      table
        .enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'])
        .defaultTo('scheduled')
        .index()
      
      // Contenu médical
      table.text('chief_complaint').nullable().comment('Motif de consultation')
      table.text('history_present_illness').nullable().comment('Histoire de la maladie actuelle')
      table.text('physical_examination').nullable().comment('Examen physique')
      table.text('diagnosis').nullable().comment('Diagnostic')
      table.text('treatment_plan').nullable().comment('Plan de traitement')
      table.text('prescriptions').nullable().comment('Prescriptions')
      table.text('recommendations').nullable().comment('Recommandations')
      table.text('notes').nullable().comment('Notes générales')
      
      // Données vitales
      table.decimal('weight_kg', 5, 2).nullable()
      table.decimal('height_cm', 5, 2).nullable()
      table.decimal('bmi', 4, 2).nullable()
      table.integer('systolic_bp').nullable()
      table.integer('diastolic_bp').nullable()
      table.integer('heart_rate').nullable()
      table.decimal('temperature_c', 4, 2).nullable()
      
      // Suivi grossesse (si applicable)
      table.integer('pregnancy_week').nullable()
      table.decimal('fundal_height_cm', 4, 1).nullable()
      table.integer('fetal_heart_rate').nullable()
      table.text('fetal_movement').nullable()
      
      // Facturation et gestion
      table.decimal('cost', 10, 2).nullable()
      table.boolean('is_paid').notNullable().defaultTo(false)
      table.dateTime('paid_at').nullable()
      
      // Personnel de supervision/validation
      table
        .integer('supervised_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('personnel')
        .onDelete('SET NULL')
      
      table
        .integer('validated_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('personnel')
        .onDelete('SET NULL')
      
      table.dateTime('validated_at').nullable()
      
      // Timestamps
      table.timestamps(true, true)
      table.timestamp('deleted_at').nullable()
      
      // Index composés pour performance
      table.index(['tenant_id', 'status'])
      table.index(['patient_id', 'scheduled_at'])
      table.index(['personnel_id', 'scheduled_at'])
      table.index(['pregnancy_id', 'scheduled_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}