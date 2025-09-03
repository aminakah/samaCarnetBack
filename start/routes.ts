/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import AuthController from '#controllers/auth_controller'

// Health check
router.get('/health', async ({ response }) => {
  return response.ok({ 
    success: true, 
    message: 'SamaCarnet API is running',
    timestamp: new Date().toISOString()
  })
})

// API v1 Routes
router.group(() => {
  
  // ============================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================
  router.group(() => {
    // Tenant management
    router.post('/tenants/register', '#controllers/auth_controller.registerTenant')
    
    // Authentication (requires tenant context)
    router.post('/auth/login', [AuthController,'login'])
    
    // Public health information
    router.get('/health/vaccine-schedule/:country?', async ({ params, response }) => {
      // Public vaccine schedule by country
      return response.ok({
        success: true,
        data: {
          country: params.country || 'SN',
          schedule: [] // TODO: Implement vaccine schedule
        }
      })
    })
  }).prefix('/public')
  
  // ============================================
  // TENANT + AUTH REQUIRED ROUTES
  // ============================================
  router.group(() => {
    
    // Authentication & Profile
    router.group(() => {
      router.post('/register', '#controllers/auth_controller.register')
      router.get('/profile', '#controllers/auth_controller.profile')
      router.put('/profile', '#controllers/auth_controller.updateProfile')
      router.post('/change-password', '#controllers/auth_controller.changePassword')
      router.post('/logout', '#controllers/auth_controller.logout')
      router.post('/refresh', '#controllers/auth_controller.refresh')
      router.get('/sync-token', '#controllers/auth_controller.getSyncToken')
      router.post('/sync-token/regenerate', '#controllers/auth_controller.regenerateSyncToken')
    }).prefix('/auth')
    
    // Pregnancy Management (REMOVED - functionality deprecated)
    router.group(() => {
      router.get('/', ({ response }) => response.ok({ success: true, message: 'Pregnancies feature deprecated', data: [] }))
    }).prefix('/pregnancies')
    
    // Consultation Management (REMOVED - functionality deprecated)
    router.group(() => {
      router.get('/', ({ response }) => response.ok({ success: true, message: 'Consultations feature deprecated', data: [] }))
    }).prefix('/consultations')
    
    // Vaccination Management (REMOVED - functionality deprecated)
    router.group(() => {
      router.get('/', ({ response }) => response.ok({ success: true, message: 'Vaccinations feature deprecated', data: [] }))
      router.get('/schedule/:patient_id', ({ response }) => response.ok({ success: true, message: 'Vaccination scheduling deprecated', data: [] }))
    }).prefix('/vaccinations')
    
    // Synchronization Endpoints
    router.group(() => {
      router.get('/status', '#controllers/sync_controller.getStatus')
      router.post('/pull', '#controllers/sync_controller.pull')
      router.post('/push', '#controllers/sync_controller.push')
      router.get('/conflicts', '#controllers/sync_controller.getConflicts')
      router.post('/conflicts/resolve', '#controllers/sync_controller.resolveConflicts')
    }).prefix('/sync')
    
    // Reports and Analytics (Admin/Doctor only)
    router.group(() => {
      router.get('/dashboard', async ({ response, auth }) => {
        return response.ok({
          success: true,
          data: {
            user: (auth.user as any)?.firstName,
            role: (auth.user as any)?.role,
            tenant: (auth.user as any)?.tenant?.name
          }
        })
      })
      router.get('/pregnancies/stats', async ({ response }) => {
        return response.ok({ success: true, data: {} })
      })
      router.get('/vaccinations/stats', async ({ response }) => {
        return response.ok({ success: true, data: {} })
      })
    }).prefix('/reports').use([
      middleware.role({ roles: ['admin', 'doctor', 'midwife'] })
    ])
    
    // User Management (Admin only)
    router.group(() => {
      router.get('/users', async ({ response }) => {
        return response.ok({ success: true, data: [] })
      })
      router.post('/users', async ({ response }) => {
        return response.created({ success: true, data: {} })
      })
      router.put('/users/:id', async ({ response }) => {
        return response.ok({ success: true, data: {} })
      })
      router.delete('/users/:id', async ({ response }) => {
        return response.ok({ success: true, message: 'User deleted' })
      })
    }).prefix('/admin').use([
      middleware.role({ roles: ['admin'] })
    ])
    
  }).use([
    middleware.tenant(),
    middleware.auth()
  ])
  
}).prefix('/api')

// Catch-all route for API
router.any('/api/*', async ({ response }) => {
  return response.notFound({
    success: false,
    message: 'API endpoint not found'
  })
})
