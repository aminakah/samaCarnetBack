import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

/**
 * ReportsController generates analytics and dashboard data
 */
export default class ReportsController {
  /**
   * Get dashboard statistics
   */
  async dashboard({ response, auth, tenant }: HttpContext) {
    try {
      // Get basic counts (pregnancies removed)
      const totalPregnancies = [{ total: 0 }] // Placeholder for removed pregnancies

      const totalPatients = await User.query()
        .where('tenant_id', tenant.id)
        .where('role', 'patient')
        .where('status', 'active')
        .count('* as total')

      const totalMedicalStaff = await User.query()
        .where('tenant_id', tenant.id)
        .whereIn('role', ['doctor', 'midwife'])
        .where('status', 'active')
        .count('* as total')

      // Get recent consultations (consultations removed)
      const recentConsultations = [{ total: 0 }] // Placeholder for removed consultations

      // Get due pregnancies (pregnancies removed)
      const duePregnancies = [{ total: 0 }] // Placeholder for removed pregnancies

      return response.ok({
        success: true,
        data: {
          overview: {
            totalPregnancies: (totalPregnancies[0] as any)?.total || 0,
            totalPatients: (totalPatients[0] as any)?.total || 0,
            medicalStaff: (totalMedicalStaff[0] as any)?.total || 0,
            recentConsultations: recentConsultations[0].$extras?.total || 0,
            duePregnancies: duePregnancies[0].$extras?.total || 0
          },
          user: {
            name: (auth.user as any)?.fullName || 'Unknown',
            role: (auth.user as any)?.role || 'unknown',
            tenant: tenant.name,
            lastLogin: (auth.user as any)?.lastLoginAt?.toFormat('dd/MM/yyyy HH:mm') || null
          },
          tenant: {
            name: tenant.name,
            subscriptionPlan: tenant.subscriptionPlan,
            subscriptionStatus: tenant.isActive ? 'active' : 'expired'
          }
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * Get pregnancy statistics (DEPRECATED - pregnancies table removed)
   */
  async pregnanciesStats({ response }: HttpContext) {
    return response.ok({
      success: true,
      data: {
        message: 'Pregnancies functionality has been removed',
        statistics: {
          total: 0,
          active: 0,
          completed: 0,
          highRisk: 0,
          firstPregnancy: 0,
          byTrimester: { first: 0, second: 0, third: 0 },
          averageAge: 0
        }
      }
    })
  }

  /**
   * Get vaccination statistics (DEPRECATED - vaccinations table removed)
   */
  async vaccinationsStats({ response }: HttpContext) {
    return response.ok({
      success: true,
      data: {
        message: 'Vaccinations functionality has been removed',
        statistics: {
          total: 0,
          administered: 0,
          scheduled: 0,
          overdue: 0
        }
      }
    })
  }

  /**
   * Get consultation trends (DEPRECATED - consultations table removed)
   */
  async consultationTrends({ response }: HttpContext) {
    return response.ok({
      success: true,
      data: {
        message: 'Consultations functionality has been removed',
        trends: []
      }
    })
  }
}
