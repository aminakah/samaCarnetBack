import vine from '@vinejs/vine'

/**
 * Sync pull validator
 */
export const syncPullValidator = vine.compile(
  vine.object({
    lastSync: vine.string().optional(), // ISO timestamp
    entityTypes: vine.array(
      vine.enum(['pregnancies', 'consultations', 'vaccinations', 'users'])
    ).optional(),
    limit: vine.number().min(1).max(500).optional() // Max items to pull
  })
)

/**
 * Sync push validator
 */
export const syncPushValidator = vine.compile(
  vine.object({
    changes: vine.array(
      vine.object({
        entityType: vine.enum(['pregnancies', 'consultations', 'vaccinations']),
        syncId: vine.string().uuid(),
        operation: vine.enum(['create', 'update', 'delete']),
        version: vine.number().min(1),
        data: vine.any(), // Entity data object
        clientTimestamp: vine.string().optional() // ISO timestamp
      })
    ),
    clientTime: vine.string().optional(), // ISO timestamp
    batchId: vine.string().optional()
  })
)

/**
 * Bidirectional sync validator
 */
export const syncBidirectionalValidator = vine.compile(
  vine.object({
    // Pull parameters
    lastSync: vine.string().optional(),
    entityTypes: vine.array(
      vine.enum(['pregnancies', 'consultations', 'vaccinations'])
    ).optional(),
    
    // Push parameters  
    changes: vine.array(
      vine.object({
        entityType: vine.enum(['pregnancies', 'consultations', 'vaccinations']),
        syncId: vine.string().uuid(),
        operation: vine.enum(['create', 'update', 'delete']),
        version: vine.number().min(1),
        data: vine.any(),
        clientTimestamp: vine.string().optional()
      })
    ).optional(),
    
    clientTime: vine.string().optional()
  })
)

/**
 * Conflict resolution validator
 */
export const conflictResolutionValidator = vine.compile(
  vine.object({
    conflicts: vine.array(
      vine.object({
        conflictId: vine.number().positive(),
        resolution: vine.enum(['client_wins', 'server_wins', 'merge']),
        resolvedData: vine.any().optional() // For merge resolution
      })
    )
  })
)

/**
 * Sync history filter validator
 */
export const syncHistoryValidator = vine.compile(
  vine.object({
    syncType: vine.enum(['pull', 'push', 'bidirectional', 'conflict_resolution']).optional(),
    status: vine.enum(['pending', 'in_progress', 'success', 'failed', 'conflict']).optional(),
    entityType: vine.enum(['pregnancies', 'consultations', 'vaccinations']).optional(),
    startDate: vine.string().optional(), // ISO date
    endDate: vine.string().optional(), // ISO date
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional()
  })
)

/**
 * Sync metrics validator
 */
export const syncMetricsValidator = vine.compile(
  vine.object({
    days: vine.number().min(1).max(30).optional(),
    entityType: vine.enum(['pregnancies', 'consultations', 'vaccinations']).optional()
  })
)

/**
 * Batch sync validator for large datasets
 */
export const batchSyncValidator = vine.compile(
  vine.object({
    batchId: vine.string().uuid(),
    batchSize: vine.number().min(1).max(100),
    batchIndex: vine.number().min(0),
    totalBatches: vine.number().min(1),
    changes: vine.array(
      vine.object({
        entityType: vine.enum(['pregnancies', 'consultations', 'vaccinations']),
        syncId: vine.string().uuid(),
        operation: vine.enum(['create', 'update', 'delete']),
        version: vine.number().min(1),
        data: vine.any()
      })
    ),
    isLastBatch: vine.boolean().optional()
  })
)
