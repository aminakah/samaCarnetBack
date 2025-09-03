import SyncLog from '#models/sync_log'
import User from '#models/user'
import { DateTime } from 'luxon'

/**
 * SyncService handles offline synchronization business logic
 */
export default class SyncService {
  /**
   * Get sync status for user
   */
  static async getSyncStatus(tenantId: number, userId: number) {
    const pendingLogs = await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('user_id', userId)
      .whereIn('status', ['pending', 'in_progress'])
      .count('* as total')

    const conflictLogs = await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('user_id', userId)
      .where('status', 'conflict')
      .count('* as total')

    return {
      pendingOperations: (pendingLogs[0] as any)?.total || 0,
      conflictCount: (conflictLogs[0] as any)?.total || 0
    }
  }

  /**
   * Pull changes from server for client
   */
  static async pullChanges(
    tenantId: number,
    userId: number,
    lastSync: DateTime | null,
    entityTypes: string[] = [] // Removed entity types: pregnancies, consultations, vaccinations
  ) {
    const changes = []
    const syncSessionId = this.generateSessionId()

    try {
      // Create sync log entry
      const syncLog = await this.createSyncLog({
        tenantId,
        userId,
        syncSessionId,
        syncType: 'pull',
        syncTrigger: 'manual',
        status: 'in_progress',
        startedAt: DateTime.now()
      })

      // Get changes for each entity type
      for (const entityType of entityTypes) {
        const entityChanges = await this.getEntityChanges(tenantId, entityType, lastSync, userId)
        changes.push(...entityChanges)
      }

      // Mark sync as successful
      await syncLog.markAsSuccess()

      // Update user's last sync time
      const user = await User.find(userId)
      if (user) {
        user.lastSyncAt = DateTime.now()
        await user.save()
      }

      return {
        success: true,
        changes,
        serverTimestamp: DateTime.now(),
        totalItems: changes.length,
        syncSessionId
      }
    } catch (error) {
      // Log the error
      const syncLog = await SyncLog.query()
        .where('sync_session_id', syncSessionId)
        .first()
      
      if (syncLog) {
        await syncLog.markAsFailed(error.message, { stack: error.stack })
      }

      throw error
    }
  }

  /**
   * Push changes from client to server
   */
  static async pushChanges(
    tenantId: number,
    userId: number,
    changes: any[],
    clientTime: DateTime = DateTime.now()
  ) {
    const results = []
    const conflicts = []
    const syncSessionId = this.generateSessionId()

    try {
      // Create sync log entry
      const syncLog = await this.createSyncLog({
        tenantId,
        userId,
        syncSessionId,
        syncType: 'push',
        syncTrigger: 'manual',
        status: 'in_progress',
        startedAt: DateTime.now(),
        clientTimestamp: clientTime
      })

      // Process each change
      for (const change of changes) {
        const result = await this.processClientChange(tenantId, userId, change)
        results.push(result)
        
        if (result.hasConflict) {
          conflicts.push(result)
        }
      }

      // Mark sync status based on results
      const hasErrors = results.some(r => !r.success)
      await syncLog.merge({
        status: hasErrors ? 'partial' : 'success',
        completedAt: DateTime.now()
      }).save()

      return {
        success: true,
        results,
        conflicts,
        serverTimestamp: DateTime.now(),
        syncSessionId,
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    } catch (error) {
      // Log the error
      const syncLog = await SyncLog.query()
        .where('sync_session_id', syncSessionId)
        .first()
      
      if (syncLog) {
        await syncLog.markAsFailed(error.message, { stack: error.stack })
      }

      throw error
    }
  }

  /**
   * Get entity changes since last sync
   */
  private static async getEntityChanges(
    tenantId: number,
    entityType: string,
    lastSync: DateTime | null,
    userId: number
  ) {
    let query
    let model

    // Map entity types to models (entities removed)
    switch (entityType) {
      default:
        return [] // All entity types have been removed
    }

    // Filter by last sync time
    if (lastSync) {
      query = query.where('updated_at', '>', lastSync.toSQL() || '')
    }

    // Apply user-specific filters based on role
    const user = await User.find(userId)
    // User-specific filters removed since entity types are removed

    const entities = await query.limit(100) // Limit to prevent large payloads

    return entities.map(entity => ({
      entityType,
      syncId: entity.syncId,
      entityId: entity.id,
      operation: 'update', // Simplified - in real app, track creates/updates/deletes
      version: entity.version,
      data: entity.serialize(),
      updatedAt: entity.updatedAt.toISO()
    }))
  }

  /**
   * Process individual change from client
   */
  private static async processClientChange(
    tenantId: number,
    userId: number,
    change: any
  ) {
    try {
      // Find existing entity
      let model, entity
      
      // All entity types have been removed
      switch (change.entityType) {
        default:
          throw new Error(`Entity type no longer supported: ${change.entityType}`)
      }

      // Handle different operations
      if (change.operation === 'create') {
        if (entity) {
          // Entity already exists, potential conflict
          return this.handleConflict(tenantId, userId, change, entity)
        }
        
        // Create new entity
        entity = new model()
        entity.merge(change.data)
        entity.tenantId = tenantId
        await entity.save()

        return {
          success: true,
          syncId: change.syncId,
          operation: 'create',
          version: entity.version,
          hasConflict: false
        }
      } else if (change.operation === 'update') {
        if (!entity) {
          // Entity doesn't exist, create it
          entity = new model()
          entity.merge(change.data)
          entity.tenantId = tenantId
          await entity.save()

          return {
            success: true,
            syncId: change.syncId,
            operation: 'create',
            version: entity.version,
            hasConflict: false
          }
        }

        // Check for version conflicts
        if (entity.version > change.version) {
          return this.handleConflict(tenantId, userId, change, entity)
        }

        // Update entity
        entity.merge(change.data)
        await entity.save()

        return {
          success: true,
          syncId: change.syncId,
          operation: 'update',
          version: entity.version,
          hasConflict: false
        }
      }

      return {
        success: false,
        syncId: change.syncId,
        error: 'Unknown operation',
        hasConflict: false
      }
    } catch (error) {
      return {
        success: false,
        syncId: change.syncId,
        error: error.message,
        hasConflict: false
      }
    }
  }

  /**
   * Handle sync conflicts
   */
  private static async handleConflict(
    tenantId: number,
    userId: number,
    clientChange: any,
    serverEntity: any
  ) {
    // Create conflict log
    const conflictLog = await this.createSyncLog({
      tenantId,
      userId,
      syncSessionId: this.generateSessionId(),
      syncType: 'conflict_resolution',
      entityType: clientChange.entityType,
      entityId: clientChange.syncId,
      operation: 'conflict',
      clientVersion: clientChange.version,
      serverVersion: serverEntity.version,
      clientData: clientChange.data,
      serverData: serverEntity.serialize(),
      hadConflict: true,
      conflictType: 'version',
      status: 'conflict',
      startedAt: DateTime.now()
    })

    return {
      success: false,
      syncId: clientChange.syncId,
      hasConflict: true,
      conflictId: conflictLog.id,
      conflictType: 'version',
      clientVersion: clientChange.version,
      serverVersion: serverEntity.version,
      serverData: serverEntity.serialize()
    }
  }

  /**
   * Get unresolved conflicts
   */
  static async getConflicts(tenantId: number, userId: number, page: number = 1, limit: number = 20) {
    const conflicts = await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('user_id', userId)
      .where('status', 'conflict')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return conflicts.serialize()
  }

  /**
   * Resolve conflicts
   */
  static async resolveConflicts(
    tenantId: number,
    userId: number,
    conflictResolutions: Array<{
      conflictId: number
      resolution: 'client_wins' | 'server_wins' | 'merge'
      resolvedData?: any
    }>
  ) {
    const results = []

    for (const resolution of conflictResolutions) {
      const conflict = await SyncLog.find(resolution.conflictId)
      
      if (!conflict || conflict.tenantId !== tenantId || conflict.userId !== userId) {
        results.push({
          conflictId: resolution.conflictId,
          success: false,
          error: 'Conflict not found'
        })
        continue
      }

      try {
        await conflict.resolveConflict(
          resolution.resolution,
          resolution.resolvedData || conflict.clientData,
          userId
        )

        results.push({
          conflictId: resolution.conflictId,
          success: true,
          resolution: resolution.resolution
        })
      } catch (error) {
        results.push({
          conflictId: resolution.conflictId,
          success: false,
          error: error.message
        })
      }
    }

    return results
  }

  /**
   * Get sync history
   */
  static async getSyncHistory(
    tenantId: number, 
    userId: number, 
    page: number = 1, 
    limit: number = 20,
    syncType?: string
  ) {
    let query = SyncLog.query()
      .where('tenant_id', tenantId)
      .where('user_id', userId)
      .orderBy('created_at', 'desc')

    if (syncType) {
      query = query.where('sync_type', syncType)
    }

    const history = await query.paginate(page, limit)
    return history.serialize()
  }

  /**
   * Reset sync state for user
   */
  static async resetSyncState(tenantId: number, userId: number) {
    // Mark all pending syncs as cancelled
    await SyncLog.query()
      .where('tenant_id', tenantId)
      .where('user_id', userId)
      .whereIn('status', ['pending', 'in_progress', 'conflict'])
      .update({ status: 'cancelled' })

    // Reset user sync timestamp
    const user = await User.find(userId)
    if (user) {
      user.lastSyncAt = null
      await user.save()
    }
  }

  /**
   * Get sync performance metrics
   */
  static async getSyncMetrics(tenantId: number, userId: number, days: number = 7) {
    const startDate = DateTime.now().minus({ days })
    
    const metrics = await SyncLog.getStatistics(tenantId, startDate, DateTime.now())
    
    return metrics
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Create sync log entry
   */
  private static async createSyncLog(data: any): Promise<SyncLog> {
    const syncLog = new SyncLog()
    Object.assign(syncLog, data)
    await syncLog.save()
    return syncLog
  }
}
