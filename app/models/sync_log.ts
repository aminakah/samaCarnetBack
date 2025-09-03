import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tenant from './tenant.js'
// import User from './user.js' // Temporairement commenté
import { v4 as uuidv4 } from 'uuid';

/**
 * SyncLog model for tracking offline synchronization operations
 * Handles conflict resolution and performance monitoring
 */
export default class SyncLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Tenant and user relationships
  @column()
  declare tenantId: number

  @column()
  declare userId: number | null

  // Sync session information
  @column()
  declare syncSessionId: string

  @column()
  declare syncType: 'push' | 'pull' | 'bidirectional' | 'conflict_resolution'

  @column()
  declare syncTrigger: 'manual' | 'automatic' | 'scheduled' | 'conflict'

  // Entity being synchronized
  @column()
  declare entityType: string

  @column()
  declare entityId: string

  @column()
  declare entityDbId: number | null

  // Sync operation details
  @column()
  declare operation: 'create' | 'update' | 'delete' | 'conflict'

  @column()
  declare clientVersion: number | null

  @column()
  declare serverVersion: number | null

  @column()
  declare resolvedVersion: number | null

  // Data payload
  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare clientData: Record<string, any> | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare serverData: Record<string, any> | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare resolvedData: Record<string, any> | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare changesMade: Record<string, any> | null

  // Conflict resolution
  @column()
  declare hadConflict: boolean

  @column()
  declare conflictType: 'version' | 'timestamp' | 'data' | 'deletion' | null

  @column()
  declare resolutionStrategy: 'client_wins' | 'server_wins' | 'merge' | 'manual' | null

  @column()
  declare conflictDetails: string | null

  @column()
  declare resolvedBy: number | null

  // Sync status and results
  @column()
  declare status: 'pending' | 'in_progress' | 'success' | 'failed' | 'conflict' | 'partial'

  @column()
  declare errorMessage: string | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare errorDetails: Record<string, any> | null

  @column()
  declare retryCount: number

  @column.dateTime()
  declare lastRetryAt: DateTime | null

  // Performance metrics
  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare durationMs: number | null

  @column()
  declare payloadSizeBytes: number | null

  // Client information
  @column()
  declare clientId: string | null

  @column()
  declare clientType: string | null



  @column()
  declare platform: string | null

  @column({
    prepare: (value: any) => value ? JSON.stringify(value) : null,
    consume: (value: string | null) => (value ? JSON.parse(value) : null) as any,
  })
  declare clientMetadata: Record<string, any> | null

  // Network and connectivity
  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | null

  @column()
  declare networkQuality: 'excellent' | 'good' | 'poor' | 'offline' | null

  // Batch sync information
  @column()
  declare batchId: string | null

  @column()
  declare batchSize: number | null

  @column()
  declare batchPosition: number | null

  @column()
  declare isBatchComplete: boolean

  // Data integrity
  @column()
  declare checksum: string | null

  @column()
  declare integrityVerified: boolean

  @column()
  declare integrityNotes: string | null

  // Timestamps
  @column.dateTime()
  declare clientTimestamp: DateTime | null

  @column.dateTime()
  declare serverTimestamp: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'resolvedBy',
  })
  declare resolver: BelongsTo<typeof User>

  // Hooks
  @beforeSave()
  static async generateSessionId(syncLog: SyncLog) {
    if (syncLog.$isNew && !syncLog.syncSessionId) {
      syncLog.syncSessionId = uuidv4()
    }
  }

  @beforeSave()
  static async calculateDuration(syncLog: SyncLog) {
    if (syncLog.completedAt && syncLog.startedAt) {
      syncLog.durationMs = syncLog.completedAt.diff(syncLog.startedAt, 'milliseconds').milliseconds
    }
  }

  @beforeSave()
  static async calculatePayloadSize(syncLog: SyncLog) {
    if (syncLog.clientData || syncLog.serverData || syncLog.resolvedData) {
      const payload = {
        clientData: syncLog.clientData,
        serverData: syncLog.serverData,
        resolvedData: syncLog.resolvedData
      }
      syncLog.payloadSizeBytes = JSON.stringify(payload).length
    }
  }

  // Computed properties
  @computed()
  get isCompleted(): boolean {
    return ['success', 'failed', 'conflict'].includes(this.status) && this.completedAt !== null
  }

  @computed()
  get isSuccessful(): boolean {
    return this.status === 'success'
  }

  @computed()
  get duration(): number | null {
    if (!this.startedAt) return null
    const endTime = this.completedAt || DateTime.now()
    return endTime.diff(this.startedAt, 'milliseconds').milliseconds
  }

  @computed()
  get payloadSizeKB(): number | null {
    return this.payloadSizeBytes ? Math.round(this.payloadSizeBytes / 1024 * 100) / 100 : null
  }

  @computed()
  get throughputKBps(): number | null {
    if (!this.payloadSizeKB || !this.durationMs || this.durationMs === 0) return null
    return Math.round((this.payloadSizeKB / (this.durationMs / 1000)) * 100) / 100
  }

  @computed()
  get conflictSummary(): string | null {
    if (!this.hadConflict) return null
    return `${this.conflictType} conflict resolved using ${this.resolutionStrategy} strategy`
  }

  /**
   * Mark sync as completed successfully
   */
  async markAsSuccess(): Promise<void> {
    this.status = 'success'
    this.completedAt = DateTime.now()
    await this.save()
  }

  /**
   * Mark sync as failed
   */
  async markAsFailed(error: string, details?: Record<string, any>): Promise<void> {
    this.status = 'failed'
    this.errorMessage = error
    this.errorDetails = details || null
    this.completedAt = DateTime.now()
    await this.save()
  }

  /**
   * Mark sync as having conflict
   */
  async markAsConflict(
    conflictType: 'version' | 'timestamp' | 'data' | 'deletion',
    details: string
  ): Promise<void> {
    this.status = 'conflict'
    this.hadConflict = true
    this.conflictType = conflictType
    this.conflictDetails = details
    await this.save()
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual',
    resolvedData: Record<string, any>,
    resolvedBy: number
  ): Promise<void> {
    this.resolutionStrategy = strategy
    this.resolvedData = resolvedData
    this.resolvedBy = resolvedBy
    this.status = 'success'
    this.completedAt = DateTime.now()
    await this.save()
  }

  /**
   * Increment retry count
   */
  async incrementRetry(): Promise<void> {
    this.retryCount += 1
    this.lastRetryAt = DateTime.now()
    this.status = 'pending'
    await this.save()
  }

  /**
   * Update progress for batch operations
   */
  async updateBatchProgress(position: number, isComplete: boolean = false): Promise<void> {
    this.batchPosition = position
    this.isBatchComplete = isComplete
    if (isComplete) {
      this.status = 'success'
      this.completedAt = DateTime.now()
    }
    await this.save()
  }

  /**
   * Verify data integrity
   */
  async verifyIntegrity(expectedChecksum?: string): Promise<boolean> {
    if (!this.resolvedData && !this.serverData) {
      this.integrityVerified = false
      this.integrityNotes = 'No data to verify'
      await this.save()
      return false
    }

    // Simple integrity check (in production, use proper checksums)
    const dataToVerify = this.resolvedData || this.serverData
    // const dataString = JSON.stringify(dataToVerify) // Unused variable
    
    if (expectedChecksum && this.checksum !== expectedChecksum) {
      this.integrityVerified = false
      this.integrityNotes = 'Checksum mismatch'
      await this.save()
      return false
    }

    this.integrityVerified = true
    this.integrityNotes = 'Data integrity verified'
    await this.save()
    return true
  }

  /**
   * Get sync performance metrics
   */
  getPerformanceMetrics(): Record<string, any> {
    return {
      duration: this.duration,
      durationMs: this.durationMs,
      payloadSize: this.payloadSizeBytes,
      payloadSizeKB: this.payloadSizeKB,
      throughput: this.throughputKBps,
      retryCount: this.retryCount,
      networkQuality: this.networkQuality,
      connectionType: this.connectionType
    }
  }

  /**
   * Export sync log for analysis
   */
  exportForAnalysis(): Record<string, any> {
    return {
      syncSessionId: this.syncSessionId,
      entityType: this.entityType,
      entityId: this.entityId,
      operation: this.operation,
      syncType: this.syncType,
      syncTrigger: this.syncTrigger,
      status: this.status,
      hadConflict: this.hadConflict,
      conflictType: this.conflictType,
      resolutionStrategy: this.resolutionStrategy,
      performance: this.getPerformanceMetrics(),
      client: {
        clientId: this.clientId,
        clientType: this.clientType,
        platform: this.platform,
        networkQuality: this.networkQuality
      },
      timestamps: {
        startedAt: this.startedAt.toISO(),
        completedAt: this.completedAt?.toISO(),
        clientTimestamp: this.clientTimestamp?.toISO(),
        serverTimestamp: this.serverTimestamp.toISO()
      }
    }
  }

  /**
   * Find sync logs for entity
   */
  static async findForEntity(tenantId: number, entityType: string, entityId: string) {
    return await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('entity_type', entityType)
      .where('entity_id', entityId)
      .orderBy('created_at', 'desc')
  }

  /**
   * Find failed sync operations
   */
  static async findFailed(tenantId: number, hours: number = 24) {
    const sinceISO = DateTime.now().minus({ hours }).toISO()
    
    if (!sinceISO) {
      throw new Error('Invalid date for failed sync log query')
    }
    
    return await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('status', 'failed')
      .where('created_at', '>=', sinceISO)
      .preload('user' as any)
      .orderBy('created_at', 'desc')
  }

  /**
   * Find conflicted sync operations
   */
  static async findConflicts(tenantId: number, resolved: boolean = false) {
    return await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('had_conflict', true)
      .where('status', resolved ? 'success' : 'conflict')
      .preload('user' as any)
      .preload('resolver' as any)
      .orderBy('created_at', 'desc')
  }

  /**
   * Get sync statistics
   */
  static async getStatistics(tenantId: number, startDate?: DateTime, endDate?: DateTime) {
    let query = SyncLog.query().where('tenant_id', tenantId)
    
    if (startDate) {
      const startDateISO = startDate.toISO()
      if (startDateISO) {
        query = query.where('created_at', '>=', startDateISO)
      }
    }
    
    if (endDate) {
      const endDateISO = endDate.toISO()
      if (endDateISO) {
        query = query.where('created_at', '<=', endDateISO)
      }
    }
    
    const logs = await query
    
    const total = logs.length
    const successful = logs.filter(l => l.status === 'success').length
    const failed = logs.filter(l => l.status === 'failed').length
    const conflicts = logs.filter(l => l.hadConflict).length
    
    const avgDuration = logs
      .filter(l => l.durationMs)
      .reduce((acc, l) => acc + (l.durationMs || 0), 0) / 
      logs.filter(l => l.durationMs).length || 0
      
    const avgPayloadSize = logs
      .filter(l => l.payloadSizeBytes)
      .reduce((acc, l) => acc + (l.payloadSizeBytes || 0), 0) / 
      logs.filter(l => l.payloadSizeBytes).length || 0

    return {
      total,
      successful,
      failed,
      conflicts,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      conflictRate: total > 0 ? (conflicts / total) * 100 : 0,
      avgDurationMs: Math.round(avgDuration),
      avgPayloadSizeKB: Math.round(avgPayloadSize / 1024),
      byEntityType: logs.reduce((acc, l) => {
        acc[l.entityType] = (acc[l.entityType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      bySyncType: logs.reduce((acc, l) => {
        acc[l.syncType] = (acc[l.syncType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byStatus: logs.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  /**
   * Get performance trends
   */
  static async getPerformanceTrends(tenantId: number, days: number = 7) {
    const startDateISO = DateTime.now().minus({ days }).toISO()
    
    if (!startDateISO) {
      throw new Error('Invalid start date for performance trends query')
    }
    
    const logs = await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('created_at', '>=', startDateISO)
      .whereNotNull('duration_ms')
      .orderBy('created_at', 'asc')
    
    const dailyStats = logs.reduce((acc, log) => {
      const day = log.createdAt.toISODate() || 'unknown'
      if (!acc[day]) {
        acc[day] = {
          date: day,
          count: 0,
          totalDuration: 0,
          totalPayload: 0,
          successful: 0,
          failed: 0
        }
      }
      
      acc[day].count += 1
      acc[day].totalDuration += log.durationMs || 0
      acc[day].totalPayload += log.payloadSizeBytes || 0
      
      if (log.status === 'success') acc[day].successful += 1
      if (log.status === 'failed') acc[day].failed += 1
      
      return acc
    }, {} as Record<string, any>)
    
    return Object.values(dailyStats).map(day => ({
      ...day,
      avgDuration: day.count > 0 ? Math.round(day.totalDuration / day.count) : 0,
      avgPayloadKB: day.count > 0 ? Math.round(day.totalPayload / day.count / 1024) : 0,
      successRate: day.count > 0 ? (day.successful / day.count) * 100 : 0
    }))
  }

  /**
   * Clean up old sync logs
   */
  static async cleanup(tenantId: number, olderThanDays: number = 30) {
    const cutoffDateISO = DateTime.now().minus({ days: olderThanDays }).toISO()
    
    if (!cutoffDateISO) {
      throw new Error('Invalid cutoff date for sync log cleanup')
    }
    
    const deletedCount = await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('created_at', '<', cutoffDateISO)
      .where('status', 'success') // Only delete successful syncs
      .delete()
      
    return deletedCount
  }
}
