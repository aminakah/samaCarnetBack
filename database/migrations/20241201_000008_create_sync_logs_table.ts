import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sync_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.increments('id').primary()
      
      // Tenant relationship
      table.integer('tenant_id').unsigned().notNullable()
      table.foreign('tenant_id').references('id').inTable('tenants').onDelete('CASCADE')
      
      // User who initiated the sync
      table.integer('user_id').unsigned().nullable()
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL')
      
      // Sync session information
      table.string('sync_session_id', 36).notNullable() // UUID for sync session
      table.enum('sync_type', ['push', 'pull', 'bidirectional', 'conflict_resolution']).notNullable()
      table.enum('sync_trigger', ['manual', 'automatic', 'scheduled', 'conflict']).notNullable()
      
      // Entity being synchronized
      table.string('entity_type', 50).notNullable() // pregnancies, consultations, vaccinations, etc.
      table.string('entity_id', 36).notNullable() // UUID of the entity
      table.integer('entity_db_id').nullable() // Database ID of the entity
      
      // Sync operation details
      table.enum('operation', ['create', 'update', 'delete', 'conflict']).notNullable()
      table.integer('client_data_version').nullable() // Version from client
      table.integer('server_version').nullable() // Version on server
      table.integer('resolved_version').nullable() // Final version after sync
      
      // Data payload
      table.json('client_data').nullable() // Data from client
      table.json('server_data').nullable() // Data on server
      table.json('resolved_data').nullable() // Final resolved data
      table.json('changes_made').nullable() // Summary of changes
      
      // Conflict resolution
      table.boolean('had_conflict').defaultTo(false)
      table.enum('conflict_type', ['version', 'timestamp', 'data', 'deletion']).nullable()
      table.enum('resolution_strategy', ['client_wins', 'server_wins', 'merge', 'manual']).nullable()
      table.text('conflict_details').nullable()
      table.integer('resolved_by').unsigned().nullable()
      table.foreign('resolved_by').references('id').inTable('users').onDelete('SET NULL')
      
      // Sync status and results
      table.enum('status', ['pending', 'in_progress', 'success', 'failed', 'conflict', 'partial']).notNullable()
      table.text('error_message').nullable()
      table.json('error_details').nullable()
      table.integer('retry_count').defaultTo(0)
      table.timestamp('last_retry_at', { useTz: true }).nullable()
      
      // Performance metrics
      table.timestamp('started_at', { useTz: true }).notNullable()
      table.timestamp('completed_at', { useTz: true }).nullable()
      table.integer('duration_ms').nullable() // Duration in milliseconds
      table.integer('payload_size_bytes').nullable()
      
      // Client information
      table.string('client_id', 100).nullable() // Device/client identifier
      table.string('client_type', 50).nullable() // mobile, web, tablet
      table.string('client_version', 20).nullable() // App version
      table.string('platform', 50).nullable() // iOS, Android, Web
      table.json('client_metadata').nullable()
      
      // Network and connectivity
      table.string('ip_address', 45).nullable()
      table.string('user_agent').nullable()
      table.enum('connection_type', ['wifi', 'cellular', 'ethernet', 'unknown']).nullable()
      table.enum('network_quality', ['excellent', 'good', 'poor', 'offline']).nullable()
      
      // Batch sync information
      table.string('batch_id', 36).nullable() // UUID for batch operations
      table.integer('batch_size').nullable()
      table.integer('batch_position').nullable()
      table.boolean('is_batch_complete').defaultTo(false)
      
      // Data integrity
      table.string('checksum', 64).nullable() // SHA-256 checksum of data
      table.boolean('integrity_verified').defaultTo(false)
      table.text('integrity_notes').nullable()
      
      // Timestamps
      table.timestamp('client_timestamp', { useTz: true }).nullable()
      table.timestamp('server_timestamp', { useTz: true }).defaultTo(this.now())
      
      // Audit and tracking
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      
      // Indexes for performance and monitoring
      table.index(['tenant_id', 'sync_session_id'])
      table.index(['tenant_id', 'entity_type'])
      table.index(['tenant_id', 'entity_id'])
      table.index(['tenant_id', 'user_id'])
      table.index(['sync_type'])
      table.index(['status'])
      table.index(['had_conflict'])
      table.index(['started_at'])
      table.index(['completed_at'])
      table.index(['batch_id'])
      table.index(['client_id'])
      
      // Composite indexes for common queries
      table.index(['tenant_id', 'status', 'started_at'])
      table.index(['tenant_id', 'entity_type', 'status'])
      table.index(['sync_session_id', 'batch_position'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
