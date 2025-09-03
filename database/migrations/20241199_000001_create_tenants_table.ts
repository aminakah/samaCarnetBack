import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tenants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.increments('id').primary()
      
      // Tenant identification
      table.string('name', 100).notNullable()
      table.string('subdomain', 50).unique().notNullable()
      table.string('domain', 100).nullable()
      
      // Contact information
      table.string('email', 100).notNullable()
      table.string('phone', 20).nullable()
      table.text('address').nullable()
      
      // Tenant configuration
      table.json('settings').nullable()
      table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active')
      table.enum('subscription_plan', ['basic', 'premium', 'enterprise']).defaultTo('basic')
      table.timestamp('subscription_expires_at').nullable()
      
      // Database connection info for multi-database tenancy
      table.string('database_name', 100).nullable()
      table.string('database_host', 100).nullable()
      table.integer('database_port').nullable()
      
      // Audit fields
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      
      // Indexes for better performance
      table.index(['subdomain'])
      table.index(['domain'])
      table.index(['status'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
