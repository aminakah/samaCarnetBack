import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Tenant from '#models/tenant'
import { loginValidator, registerValidator, changePasswordValidator } from '#validators/auth_validator'
import hash from '@adonisjs/core/services/hash'
import AuthService from '#services/auth_service'
import { DateTime } from 'luxon'

/**
 * AuthController handles authentication and user management
 */
export default class AuthController {
  /**
   * Login user with automatic tenant detection
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    
    try {
      // Détecter automatiquement le tenant basé sur l'email
      const { tenantId, isSuperAdmin } = this.determineTenantFromEmail(email)
      console.log('Tenant détecté automatiquement:', { email, tenantId, isSuperAdmin })

      const authResult = await AuthService.authenticate(email, password, tenantId)
      if (!authResult.success) {
        return response.unauthorized({
          success: false,
          message: authResult.message
        })
      }

      const user = authResult.user!

      // Mettre à jour le tenant de l'utilisateur si nécessaire
      if (user.tenantId !== tenantId) {
        user.tenantId = tenantId
        await user.save()
      }

      // Update login tracking
      await user.updateLastLogin(request.ip())

      // Create access token
      const token = await User.accessTokens.create(user)
      
      return response.ok({
        success: true,
        data: {
          token: token.value?.release(),
          user: {
            ...user.serialize(),
            isSuperAdmin
          }
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Détermine automatiquement le tenant basé sur l'email
   */
  private determineTenantFromEmail(email: string): { tenantId: string; isSuperAdmin: boolean } {
    // Patterns pour détecter les super administrateurs
    const superAdminPatterns = [
      '@superadmin.',
      'super@',
      'global@',
      'system@',
      'dev@samacarnet.sn',
      'admin@samacarnet.sn'
    ]

    const emailLower = email.toLowerCase()
    const isSuperAdmin = superAdminPatterns.some(pattern => 
      emailLower.includes(pattern.toLowerCase())
    )

    if (isSuperAdmin) {
      return {
        tenantId: 'global',
        isSuperAdmin: true
      }
    }

    // Pour les utilisateurs normaux, détecter le tenant depuis le domaine email
    const emailParts = email.split('@')
    if (emailParts.length === 2) {
      const domain = emailParts[1]
      
      // Mapping des domaines vers les tenants
      const domainToTenant: Record<string, string> = {
        'dakar-health.sn': '1',
        'almadies-clinic.sn': '2',
        'thies-hospital.sn': '3',
        'clinic.sn': '1',
        'hospital.sn': '1'
      }

      const tenantId = domainToTenant[domain] || '1'

      return {
        tenantId,
        isSuperAdmin: false
      }
    }

    // Par défaut, assigner au tenant 1
    return {
      tenantId: '1',
      isSuperAdmin: false
    }
  }

  /**
   * Register new user to tenant
   */
  async register({ request, response, tenant }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    try {
      const result = await AuthService.register({
        tenantId: tenant.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        role: payload.role || 'patient',
        phone: payload.phone,
        dateOfBirth: payload.dateOfBirth ? DateTime.fromISO(payload.dateOfBirth) : undefined
      })

      if (!result.success) {
        return response.badRequest({
          success: false,
          message: result.message
        })
      }

      const user = result.user!

      return response.created({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            syncToken: user.syncToken
          }
        }
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Register new tenant (public endpoint)
   */
  async registerTenant({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    try {
      // First create tenant
      const tenant = new Tenant()
      tenant.name = payload.organizationName || `${payload.firstName} ${payload.lastName} Clinic`
      tenant.subdomain = payload.subdomain || `tenant${Date.now()}`
      tenant.email = payload.email
      tenant.phone = payload.phone ||""
      tenant.status = 'active'
      tenant.subscriptionPlan = 'basic'

      await tenant.save()

      // Then create admin user for tenant
      const result = await AuthService.register({
        tenantId: tenant.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        role: 'admin'
      })

      if (!result.success) {
        // Rollback tenant creation
        await tenant.delete()
        return response.badRequest({
          success: false,
          message: result.message
        })
      }

      return response.created({
        success: true,
        data: {
          tenant: {
            id: tenant.id,
            name: tenant.name,
            subdomain: tenant.subdomain
          },
          user: {
            id: result.user!.id,
            name: result.user!.fullName,
            email: result.user!.email,
            role: result.user!.role
          }
        }
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Tenant registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get user profile
   */
  async profile({ response, auth }: HttpContext) {
    try {
      if (!auth.user) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }

      const user = auth.user as unknown as User
      await user.load('tenant')
      
      return response.ok({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth?.toISODate(),
            gender: user.gender,
            address: user.address,
            preferredLanguage: user.preferredLanguage,
            tenant: {
              id: user.tenant.id,
              name: user.tenant.name,
              subdomain: user.tenant.subdomain
            },
            syncToken: user.syncToken,
            lastSync: user.lastSyncAt?.toISO(),
            version: user.version
          }
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch profile'
      })
    }
  }

  /**
   * Update user profile
   */
  // async updateProfile({ request, response, auth }: HttpContext) {
  //   const user = auth.user!
    
  //   try {
  //     const payload = request.only([
  //       'firstName', 'lastName', 'phone', 'address', 
  //       'preferredLanguage', 'emergencyContactName', 'emergencyContactPhone'
  //     ])

  //     user.merge(payload)
  //     await user.save()

  //     return response.ok({
  //       success: true,
  //       data: user
  //     })
  //   } catch (error) {
  //     return response.badRequest({
  //       success: false,
  //       message: 'Failed to update profile'
  //     })
  //   }
  // }

  /**
   * Change password
   */
  async changePassword({ request, response, auth }: HttpContext) {
    const { currentPassword, newPassword } = await request.validateUsing(changePasswordValidator)
    
    if (!auth.user) {
      return response.unauthorized({
        success: false,
        message: 'User not authenticated'
      })
    }
    
    const user = auth.user as unknown as User

    try {
      // Verify current password
      const isValidPassword = await hash.verify(user.password, currentPassword)
      if (!isValidPassword) {
        return response.badRequest({
          success: false,
          message: 'Current password is incorrect'
        })
      }

      // Update password
      user.merge({ password: newPassword })
      await user.save()

      return response.ok({
        success: true,
        message: 'Password changed successfully'
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Failed to change password'
      })
    }
  }

  /**
   * Logout user
   */
  async logout({ auth, response }: HttpContext) {
    try {
      if (!auth.user) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }

      const user = auth.user as unknown as User
      await User.accessTokens.delete(user as any, (auth.user as any).currentAccessToken.identifier)
      
      return response.ok({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Logout failed'
      })
    }
  }

  /**
   * Get sync token for offline synchronization
   */
  // async getSyncToken({ response, auth }: HttpContext) {
  //   try {
  //     return response.ok({
  //       success: true,
  //       data: {
  //         syncToken: auth.user!.syncToken,
  //         lastSync: auth.user!.lastSyncAt?.toISO(),
  //         version: auth.user!.version
  //       }
  //     })
  //   } catch (error) {
  //     return response.internalServerError({
  //       success: false,
  //       message: 'Failed to get sync token'
  //     })
  //   }
  // }

  /**
   * Regenerate sync token
   */
  // async regenerateSyncToken({ response, auth }: HttpContext) {
  //   try {
  //     const newToken = await AuthService.generateSyncToken(auth.user!)
      
  //     return response.ok({
  //       success: true,
  //       data: {
  //         syncToken: newToken,
  //         message: 'Sync token regenerated successfully'
  //       }
  //     })
  //   } catch (error) {
  //     return response.internalServerError({
  //       success: false,
  //       message: 'Failed to regenerate sync token'
  //     })
  //   }
  // }
}
