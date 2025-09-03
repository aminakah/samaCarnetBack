import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Tenant from '#models/tenant'

/**
 * TenantMiddleware extracts and validates tenant from request
 * Supports subdomain and custom domain routing
 */
export default class TenantMiddleware {
  /**
   * Handle tenant resolution from request
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx

    try {
      // Extract tenant information from request
      const tenant = await this.resolveTenant(request)

      if (!tenant) {
        return response.badRequest({
          success: false,
          message: 'Tenant not found or inactive'
        })
      }

      // Check if tenant is active and subscription is valid
      if (!tenant.isActive) {
        return response.forbidden({
          success: false,
          message: 'Tenant subscription expired or inactive'
        })
      }

      // Add tenant to context for use in controllers
      ctx.tenant = tenant

      await next()
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to resolve tenant'
      })
    }
  }

  /**
   * Resolve tenant from request headers and domain
   */
  private async resolveTenant(request: any): Promise<Tenant | null> {
    // Method 1: Check for tenant ID in headers (for API requests)
    const tenantHeader = request.header('x-tenant-id')
    if (tenantHeader) {
      return await Tenant.query()
        .where('id', tenantHeader)
        .where('status', 'active')
        .first()
    }

    // Method 2: Extract from subdomain
    const host = request.header('host') || ''
    const hostParts = host.split('.')

    if (hostParts.length >= 3) {
      const subdomain = hostParts[0]
      
      // Skip common subdomains
      if (!['www', 'api', 'app', 'admin'].includes(subdomain)) {
        const tenant = await Tenant.findBySubdomain(subdomain)
        if (tenant) return tenant
      }
    }

    // Method 3: Check for custom domain
    const tenant = await Tenant.findByDomain(host)
    if (tenant) return tenant

    // Method 4: Default tenant for development (optional)
    if (process.env.NODE_ENV === 'development') {
      const defaultTenant = request.header('x-default-tenant')
      if (defaultTenant) {
        return await Tenant.query()
          .where('subdomain', defaultTenant)
          .orWhere('id', defaultTenant)
          .first()
      }
    }

    return null
  }

  /**
   * Optional: Handle tenant-specific database connections
   */
  private async configureTenantDatabase(_tenant: Tenant): Promise<void> {
    // If using separate databases per tenant
    const dbConfig = (_tenant as any).getDatabaseConfig()
    if (dbConfig) {
      // Configure tenant-specific database connection
      // This would require additional setup in the database config
    }
  }

  /**
   * Validate tenant access for specific operations
   */
  static async validateTenantAccess(
    tenantId: number, 
    requestedTenantId: number
  ): Promise<boolean> {
    return tenantId === requestedTenantId
  }

  /**
   * Get tenant from context helper
   */
  static getTenant(ctx: HttpContext): Tenant {
    if (!ctx.tenant) {
      throw new Error('Tenant not found in context. TenantMiddleware may not be applied.')
    }
    return ctx.tenant
  }
}

// Extend HttpContext to include tenant
declare module '@adonisjs/core/http' {
  interface HttpContext {
    tenant: Tenant
  }
}
