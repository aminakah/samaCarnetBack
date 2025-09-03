import type { HttpContext } from '@adonisjs/core/http'
import SyncService from '#services/sync_service'
import { syncPullValidator, syncPushValidator } from '#validators/sync_validator'
import { DateTime } from 'luxon'

/**
 * SyncController manages offline synchronization
 */
export default class SyncController {
  /**
   * Get synchronization status for client
   */
  async getStatus({ response, auth, tenant }: HttpContext) {
    try {
      const status = await SyncService.getSyncStatus(tenant.id, (auth.user as any)!.id)
      
      return response.ok({
        success: true,
        data: {
          userId: (auth.user as any)!.id,
          tenantId: tenant.id,
          syncToken: (auth.user as any)!.syncToken,
          lastSync: (auth.user as any)!.lastSyncAt?.toISO(),
          serverTime: DateTime.now().toISO(),
          version: (auth.user as any)!.version,
          pendingSyncOperations: status.pendingOperations,
          conflictCount: status.conflictCount,
          syncEnabled: true
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to get sync status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Pull changes from server to client
   */
  async pull({ request, response, auth, tenant }: HttpContext) {
    const payload = await request.validateUsing(syncPullValidator)

    try {
      const lastSync = payload.lastSync ? DateTime.fromISO(payload.lastSync) : null
      const entityTypes = payload.entityTypes || ['pregnancies', 'consultations', 'vaccinations']

      const result = await SyncService.pullChanges(
        tenant.id, 
        (auth.user as any)!.id, 
        lastSync, 
        entityTypes
      )

      return response.ok({
        success: true,
        data: result,
        serverTime: DateTime.now().toISO()
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Sync pull failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Push changes from client to server
   */
  async push({ request, response, auth, tenant }: HttpContext) {
    const payload = await request.validateUsing(syncPushValidator)

    try {
      const result = await SyncService.pushChanges(
        tenant.id, 
        (auth.user as any)!.id, 
        payload.changes,
        payload.clientTime ? DateTime.fromISO(payload.clientTime) : DateTime.now()
      )

      return response.ok({
        success: true,
        data: result,
        serverTime: DateTime.now().toISO()
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Sync push failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Bidirectional sync (pull + push)
   */
  async bidirectional({ request, response, auth, tenant }: HttpContext) {
    try {
      // First pull latest changes
      const pullPayload = request.only(['lastSync', 'entityTypes'])
      const lastSync = pullPayload.lastSync ? DateTime.fromISO(pullPayload.lastSync) : null
      const entityTypes = pullPayload.entityTypes || ['pregnancies', 'consultations', 'vaccinations']

      const pullResult = await SyncService.pullChanges(
        tenant.id, 
        (auth.user as any)!.id, 
        lastSync, 
        entityTypes
      )

      // Then push client changes
      const pushPayload = request.only(['changes', 'clientTime'])
      const pushResult = await SyncService.pushChanges(
        tenant.id, 
        (auth.user as any)!.id, 
        pushPayload.changes || [],
        pushPayload.clientTime ? DateTime.fromISO(pushPayload.clientTime) : DateTime.now()
      )

      return response.ok({
        success: true,
        data: {
          pull: pullResult,
          push: pushResult,
          totalConflicts: pushResult.conflicts?.length || 0
        },
        serverTime: DateTime.now().toISO()
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Bidirectional sync failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get unresolved conflicts
   */
  async getConflicts({ request, response, auth, tenant }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = Math.min(request.input('limit', 20), 100)

      const conflicts = await SyncService.getConflicts(tenant.id, (auth.user as any)!.id, page, limit)
      
      return response.ok({
        success: true,
        data: conflicts
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to get conflicts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Resolve synchronization conflicts
   */
  async resolveConflicts({ request, response, auth, tenant }: HttpContext) {
    const { conflicts } = request.only(['conflicts'])

    try {
      const results = await SyncService.resolveConflicts(
        tenant.id,
        (auth.user as any)!.id,
        conflicts
      )

      return response.ok({
        success: true,
        data: results,
        message: 'Conflicts resolved successfully'
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to resolve conflicts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get sync history and logs
   */
  async getSyncHistory({ request, response, auth, tenant }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = Math.min(request.input('limit', 20), 100)
      const syncType = request.input('syncType') // 'pull', 'push', 'bidirectional'

      const history = await SyncService.getSyncHistory(
        tenant.id, 
        (auth.user as any)!.id, 
        page, 
        limit,
        syncType
      )
      
      return response.ok({
        success: true,
        data: history
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to get sync history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Reset sync state (emergency use)
   */
  async resetSync({ response, auth, tenant }: HttpContext) {
    try {
      // Only allow for current user
      await SyncService.resetSyncState(tenant.id, (auth.user as any)!.id)
      
      // Regenerate sync token
      await (auth.user as any)!.regenerateSyncToken()
      
      return response.ok({
        success: true,
        data: {
          syncToken: (auth.user as any)!.syncToken,
          message: 'Sync state reset successfully'
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to reset sync state',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get sync performance metrics
   */
  async getMetrics({ request, response, auth, tenant }: HttpContext) {
    try {
      const days = Math.min(request.input('days', 7), 30) // Max 30 days
      
      const metrics = await SyncService.getSyncMetrics(tenant.id, (auth.user as any)!.id, days)
      
      return response.ok({
        success: true,
        data: metrics
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to get sync metrics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}
