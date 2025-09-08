import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.increments('id').primary()
      
      // Tenant relationship
      table.integer('tenant_id').unsigned().nullable
      table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE')
      
      // Basic user information
      table.string('first_name', 50).notNullable()
      table.string('last_name', 50).notNullable()
      table.string('email', 100).notNullable()
      table.string('phone', 20).nullable()
      table.date('date_of_birth').nullable()
      table.enum('gender', ['male', 'female', 'other']).nullable()
      
      table.string('password').notNullable()
      table.timestamp('email_verified_at', { useTz: true }).nullable()
      table.string('remember_me_token').nullable()
      
    
      
      // Professional information (for medical staff)
      table.string('license_number', 50).nullable()
      table.json('specialties').nullable()
      table.text('bio').nullable()
      
      // Patient specific information
      table.string('emergency_contact_name', 100).nullable()
      table.string('emergency_contact_phone', 20).nullable()
      table.json('medical_history').nullable()
      table.json('allergies').nullable()
      
      // Profile and preferences
      table.text('address').nullable()
      table.string('avatar_url').nullable()
      table.string('preferred_language', 5).defaultTo('fr')
      table.json('notification_preferences').nullable()
      
      // Status and tracking
      table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active')
      table.timestamp('last_login_at', { useTz: true }).nullable()
      table.string('last_login_ip', 45).nullable()
      
      // Sync and offline support
      table.string('sync_token', 100).nullable()
      table.timestamp('last_sync_at', { useTz: true }).nullable()
      table.integer('version').defaultTo(1)
      
      // Audit fields
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      
      // Unique constraints per tenant
      table.unique(['tenant_id', 'email'])
      table.unique(['tenant_id', 'license_number'])
      
      // Indexes for performance
      table.index(['tenant_id',])
      table.index(['tenant_id', 'status'])
      table.index(['email'])
      table.index(['last_sync_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
