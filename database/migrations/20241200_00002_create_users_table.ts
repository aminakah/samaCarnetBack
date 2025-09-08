import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE')
      .index()
      
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
      table.boolean('is_active').notNullable().defaultTo(true)
      
      // Audit fields
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      
    
      table.index(['email'])
      table.index(['last_sync_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
