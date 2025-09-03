import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

/**
 * RoleMiddleware checks if authenticated user has required role
 */
export default class RoleMiddleware {
  /**
   * Handle role authorization
   */
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      roles?: string[]
    } = {}
  ) {
    const { response, auth } = ctx
    
    // Check if user is authenticated
    if (!auth?.user) {
      return response.unauthorized({
        success: false,
        message: 'Authentication required'
      })
    }

    const user = auth.user as unknown as User
    const { roles = [] } = options

    // If no roles specified, just check authentication
    if (roles.length === 0) {
      await next()
      return
    }

    // Check if user has required role
    if (!roles.includes(user.role)) {
      return response.forbidden({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        user_role: user.role
      })
    }

    // Admin role has access to everything
    if (user.role === 'admin') {
      await next()
      return
    }

    await next()
  }

  /**
   * Static helper to check role permissions
   */
  static hasRole(user: User | null, roles: string[]): boolean {
    if (!user || !user.role) return false
    if (user.role === 'admin') return true
    return roles.includes(user.role)
  }

  /**
   * Static helper to check if user can access patient data
   */
  static canAccessPatientData(user: User | null, patientId: number): boolean {
    if (!user) return false
    
    // Admin can access all
    if (user.role === 'admin') return true
    
    // Medical staff can access assigned patients
    if (['doctor', 'midwife'].includes(user.role)) return true
    
    // Patients can only access their own data
    if (user.role === 'patient') return user.id === patientId
    
    return false
  }

  /**
   * Static helper to check medical staff permissions
   */
  static isMedicalStaff(user: User | null): boolean {
    if (!user) return false
    return ['admin', 'doctor', 'midwife'].includes(user.role)
  }
}
