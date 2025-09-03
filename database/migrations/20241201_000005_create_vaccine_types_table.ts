import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vaccine_types'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.increments('id').primary()
      
      // Vaccine identification
      table.string('name', 100).notNullable()
      table.string('code', 20).unique().notNullable() // WHO vaccine code
      table.text('description').nullable()
      
      // Vaccine details
      table.string('manufacturer', 100).nullable()
      table.string('brand_name', 100).nullable()
      table.enum('vaccine_type', ['live', 'inactivated', 'subunit', 'toxoid', 'mRNA', 'viral_vector']).notNullable()
      
      // Target population
      table.enum('target_group', ['infant', 'child', 'adolescent', 'adult', 'pregnant_women', 'elderly', 'all']).notNullable()
      table.integer('min_age_months').nullable() // Minimum age in months
      table.integer('max_age_months').nullable() // Maximum age in months
      
      // Administration details
      table.enum('route', ['oral', 'intramuscular', 'subcutaneous', 'intradermal', 'intranasal']).notNullable()
      table.string('site', 50).nullable() // injection site
      table.decimal('dose_volume', 4, 2).nullable() // in ml
      
      // Scheduling information
      table.integer('doses_required').defaultTo(1)
      table.json('schedule_intervals').nullable() // intervals between doses in days
      table.integer('booster_interval_months').nullable()
      table.boolean('requires_booster').defaultTo(false)
      
      // Storage and handling
      table.integer('storage_temp_min').nullable() // in celsius
      table.integer('storage_temp_max').nullable() // in celsius
      table.integer('shelf_life_months').nullable()
      table.text('storage_instructions').nullable()
      
      // Safety information
      table.json('contraindications').nullable()
      table.json('precautions').nullable()
      table.json('side_effects').nullable()
      table.json('adverse_reactions').nullable()
      
      // Disease prevention
      table.json('diseases_prevented').notNullable()
      table.text('efficacy_rate').nullable()
      table.integer('immunity_duration_years').nullable()
      
      // WHO/National program information
      table.boolean('is_who_approved').defaultTo(false)
      table.boolean('is_national_program').defaultTo(false)
      table.boolean('is_mandatory').defaultTo(false)
      table.integer('priority_level').defaultTo(1) // 1 = highest priority
      
      // Multi-language support
      table.json('name_translations').nullable()
      table.json('description_translations').nullable()
      
      // Status and availability
      table.enum('status', ['active', 'inactive', 'discontinued', 'under_review']).defaultTo('active')
      table.date('approval_date').nullable()
      table.date('discontinuation_date').nullable()
      
      // Sync and versioning
      table.string('sync_id', 36).unique().notNullable() // UUID for sync
      table.integer('version').defaultTo(1)
      table.timestamp('last_sync_at', { useTz: true }).nullable()
      table.boolean('is_synced').defaultTo(false)
      
      // Audit fields
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      
      // Indexes for performance
      table.index(['code'])
      table.index(['target_group'])
      table.index(['vaccine_type'])
      table.index(['status'])
      table.index(['is_national_program'])
      table.index(['is_mandatory'])
      table.index(['priority_level'])
      table.index(['sync_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
