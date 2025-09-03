import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vaccine_schedules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.increments('id').primary()
      
      // Tenant relationship
      table.integer('tenant_id').unsigned().notNullable()
      table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE')
      
      // Patient relationship
      table.integer('patient_id').unsigned().notNullable()
      table.foreign('patient_id').references('id').inTable('users').onDelete('CASCADE')
      
      // Vaccine type relationship
      table.integer('vaccine_type_id').unsigned().notNullable()
      table.foreign('vaccine_type_id').references('id').inTable('vaccine_types').onDelete('CASCADE')
      
      // Schedule information
      table.integer('dose_number').notNullable() // 1st dose, 2nd dose, etc.
      table.date('scheduled_date').notNullable()
      table.date('due_date').notNullable() // Latest date for administration
      table.date('earliest_date').nullable() // Earliest possible date
      
      // Age-based scheduling
      table.integer('scheduled_age_months').nullable()
      table.integer('scheduled_age_days').nullable()
      
      // Special considerations
      table.boolean('is_catch_up').defaultTo(false) // Catch-up vaccination
      table.boolean('is_booster').defaultTo(false)
      table.boolean('is_seasonal').defaultTo(false)
      table.integer('season_year').nullable()
      
      // Pregnancy-related scheduling
    
      table.integer('gestational_week').nullable() // For pregnancy vaccinations
      
      // Schedule status
      table.enum('status', ['scheduled', 'due', 'overdue', 'completed', 'missed', 'contraindicated', 'deferred']).defaultTo('scheduled')
      table.text('notes').nullable()
      table.text('deferral_reason').nullable()
      table.date('rescheduled_date').nullable()
      
      // Reminders and notifications
      table.boolean('reminder_sent').defaultTo(false)
      table.timestamp('reminder_sent_at', { useTz: true }).nullable()
      table.integer('reminder_count').defaultTo(0)
      table.date('next_reminder_date').nullable()
      
      // Healthcare provider assignment
      table.integer('assigned_provider_id').unsigned().nullable()
      table.foreign('assigned_provider_id').references('id').inTable('users').onDelete('SET NULL')
      
      // Auto-generation tracking
      table.boolean('auto_generated').defaultTo(true)
      table.string('generation_rule', 100).nullable()
      table.json('generation_parameters').nullable()
      
      // Priority and urgency
      table.enum('priority', ['low', 'normal', 'high', 'urgent']).defaultTo('normal')
      table.boolean('is_mandatory').defaultTo(false)
      table.text('priority_reason').nullable()
      
      // Dependencies on other vaccinations
      table.json('prerequisites').nullable() // IDs of vaccines that must be completed first
      table.boolean('can_co_administer').defaultTo(true)
      table.json('contraindicated_with').nullable() // Vaccines that cannot be given together
      
      // Sync and versioning for offline support
      table.string('sync_id', 36).unique().notNullable() // UUID for sync
      table.integer('version').defaultTo(1)
      table.timestamp('last_sync_at', { useTz: true }).nullable()
      table.boolean('is_synced').defaultTo(false)
      table.json('pending_changes').nullable()
      
      // Audit fields
      table.integer('created_by').unsigned().nullable()
      table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL')
      table.integer('updated_by').unsigned().nullable()
      table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      
      // Unique constraint to prevent duplicate schedules
      table.unique(['tenant_id', 'patient_id', 'vaccine_type_id', 'dose_number'], 'vaccine_sched_unique')
      
      // Indexes for performance
      table.index(['tenant_id', 'patient_id'])
      table.index(['tenant_id', 'scheduled_date'])
      table.index(['tenant_id', 'due_date'])
      table.index(['status'])
      table.index(['priority'])
      table.index(['reminder_sent'])
      table.index(['next_reminder_date'])
      table.index(['sync_id'])
      table.index(['last_sync_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
