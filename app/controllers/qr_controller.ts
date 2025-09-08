import type { HttpContext } from '@adonisjs/core/http'
import PatientQr from '#models/patient_qr'
import CrossTenantService from '#services/cross_tenant_service'
import Patient from '#models/patient'

export default class QrController {
  /**
   * Generate QR code for patient
   */
  async generateQr({ request, response, auth }: HttpContext) {
    try {
      const { patientId } = request.only(['patientId'])
      const user = auth.user!

      // Check permission
      if (!await user.hasPermission('patient.create')) {
        return response.forbidden({
          success: false,
          message: 'Permission refusée'
        })
      }

      // Verify patient belongs to user's tenant
      const patient = await Patient.query()
        .where('id', patientId)
        .where('tenant_id', user.tenantId)
        .first()

      if (!patient) {
        return response.notFound({
          success: false,
          message: 'Patient non trouvé'
        })
      }

      // Deactivate existing QR codes
      await PatientQr.query()
        .where('patient_id', patientId)
        .update({ is_active: false })

      // Generate new QR code
      const patientQr = await PatientQr.generateForPatient(patientId)

      return response.ok({
        success: true,
        data: {
          qrCode: patientQr.qrCode,
          qrCodeImage: patientQr.qrCodeImage
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erreur lors de la génération du QR code'
      })
    }
  }

  /**
   * Scan QR code and get patient info
   */
  async scanQr({ request, response, auth }: HttpContext) {
    try {
      const { qrCode } = request.only(['qrCode'])
      const user = auth.user!

      // Check QR scan permission
      if (!await user.hasPermission('patient.qr_scan')) {
        return response.forbidden({
          success: false,
          message: 'Permission de scan refusée'
        })
      }

      // Scan QR code
      const scanResult = await CrossTenantService.scanPatientQr(qrCode, user.id)

      if (!scanResult.success || !scanResult.patient) {
        return response.badRequest({
          success: false,
          message: scanResult.message
        })
      }

      // Get filtered patient data based on access level
      const patientData = await CrossTenantService.getPatientDataByAccessLevel(
        scanResult.patient,
        scanResult.accessLevel
      )

      return response.ok({
        success: true,
        data: {
          patient: patientData,
          accessLevel: scanResult.accessLevel,
          crossTenant: user.tenantId !== scanResult.patient.tenantId,
          message: scanResult.message
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erreur lors du scan'
      })
    }
  }

  /**
   * Create cross-tenant consultation
   */
  async createCrossTenantConsultation({ request, response, auth }: HttpContext) {
    try {
      const { patientId, consultationData } = request.all()
      const user = auth.user!

      // Check if user can create consultation for this patient
      const canCreate = await CrossTenantService.canCreateConsultation(user.id, patientId)
      if (!canCreate) {
        return response.forbidden({
          success: false,
          message: 'Permission refusée pour ce patient'
        })
      }

      // Load patient
      const patient = await Patient.find(patientId)
      if (!patient) {
        return response.notFound({
          success: false,
          message: 'Patient non trouvé'
        })
      }

      // Create consultation with cross-tenant flag
      const consultation = await patient.related('consultations').create({
        ...consultationData,
        consultingPersonnelId: user.id,
        isCrossTenant: user.tenantId !== patient.tenantId,
        crossTenantNote: `Consultation effectuée par ${user.fullName} (${user.tenant?.name})`
      })

      return response.created({
        success: true,
        data: consultation,
        message: 'Consultation créée avec succès'
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erreur lors de la création de la consultation'
      })
    }
  }

  /**
   * Get patient QR code (for mobile app)
   */
  async getPatientQr({ response, auth, params }: HttpContext) {
    try {
      const user = auth.user!
      const patientId = params.id

      // Patients can only get their own QR code
      if (await user.isPatient()) {
        const patient = await Patient.query()
          .where('id', patientId)
          .where('user_id', user.id) // Patient's own record
          .first()

        if (!patient) {
          return response.forbidden({
            success: false,
            message: 'Accès refusé'
          })
        }
      } else {
        // Medical staff can get QR for patients in their tenant
        if (!await user.hasPermission('patient.view_all')) {
          return response.forbidden({
            success: false,
            message: 'Permission refusée'
          })
        }
      }

      // Get active QR code
      const patientQr = await PatientQr.query()
        .where('patient_id', patientId)
        .where('is_active', true)
        .first()

      if (!patientQr) {
        return response.notFound({
          success: false,
          message: 'QR code non trouvé'
        })
      }

      return response.ok({
        success: true,
        data: {
          qrCode: patientQr.qrCode,
          qrCodeImage: patientQr.qrCodeImage,
          scanCount: patientQr.scanCount,
          lastScanned: patientQr.lastScannedAt
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erreur lors de la récupération du QR code'
      })
    }
  }
}