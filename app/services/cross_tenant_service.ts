import User from '#models/user'
import Patient from '#models/patient'
import PatientQr from '#models/patient_qr'
import { DateTime } from 'luxon'

export default class CrossTenantService {
  /**
   * Scan QR code and get patient info (cross-tenant access)
   */
  static async scanPatientQr(
    qrCode: string, 
    scannerUserId: number
  ): Promise<{
    success: boolean
    patient?: Patient
    accessLevel: 'full' | 'basic' | 'emergency' | 'none'
    message?: string
  }> {
    try {
      // Find patient by QR code
      const patient = await PatientQr.findPatientByQrCode(qrCode)
      if (!patient) {
        return { success: false, accessLevel: 'none', message: 'QR code invalide' }
      }

      // Get scanner user with roles
      const scanner = await User.find(scannerUserId)
      if (!scanner) {
        return { success: false, accessLevel: 'none', message: 'Utilisateur non trouvé' }
      }

      // Check if scanner is medical staff
      const isMedicalStaff = await scanner.isMedicalStaff()
      if (!isMedicalStaff) {
        return { success: false, accessLevel: 'none', message: 'Accès non autorisé' }
      }

      // Determine access level based on scanner role and patient tenant
      let accessLevel: 'full' | 'basic' | 'emergency' | 'none' = 'none'

      if (scanner.tenantId === patient.tenantId) {
        // Same tenant - full access
        accessLevel = 'full'
      } else {
        // Cross-tenant access - check role level
        const roles = await scanner.getActiveRoles()
        const highestLevel = Math.max(...roles.map(r => r.level))

        if (highestLevel >= 80) { // Gynecologist level
          accessLevel = 'full'
        } else if (highestLevel >= 70) { // Doctor/Midwife level
          accessLevel = 'basic'
        } else if (highestLevel >= 60) { // Nurse level
          accessLevel = 'emergency'
        }
      }

      // Log access for audit
      await this.logCrossTenantAccess({
        scannerId: scannerUserId,
        patientId: patient.id,
        accessLevel,
        scannerTenantId: scanner.tenantId,
        patientTenantId: patient.tenantId
      })

      return {
        success: true,
        patient,
        accessLevel,
        message: `Accès ${accessLevel} accordé`
      }
    } catch (error) {
      return {
        success: false,
        accessLevel: 'none',
        message: 'Erreur lors du scan'
      }
    }
  }

  /**
   * Get filtered patient data based on access level
   */
  static async getPatientDataByAccessLevel(
    patient: Patient,
    accessLevel: 'full' | 'basic' | 'emergency' | 'none'
  ) {
    const baseData = {
      id: patient.id,
      patientNumber: patient.patientNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType
    }

    switch (accessLevel) {
      case 'full':
        // Load all data including sensitive information
        await patient.load('pregnancies', (query) => {
          query.preload('consultations')
          query.preload('prescriptions')
        })
        await patient.load('vaccinations')
        await patient.load('allergies')
        
        return {
          ...baseData,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          emergencyContact: {
            name: patient.emergencyContactName,
            phone: patient.emergencyContactPhone
          },
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          pregnancies: patient.pregnancies,
          vaccinations: patient.vaccinations
        }

      case 'basic':
        // Essential medical data only
        await patient.load('pregnancies', (query) => {
          query.where('is_active', true)
          query.preload('consultations', (consQuery) => {
            consQuery.orderBy('consultation_date', 'desc').limit(5)
          })
        })
        await patient.load('allergies')

        return {
          ...baseData,
          emergencyContact: {
            name: patient.emergencyContactName,
            phone: patient.emergencyContactPhone
          },
          allergies: patient.allergies,
          currentPregnancy: patient.pregnancies?.[0] || null,
          recentConsultations: patient.pregnancies?.[0]?.consultations || []
        }

      case 'emergency':
        // Critical information only
        return {
          ...baseData,
          emergencyContact: {
            name: patient.emergencyContactName,
            phone: patient.emergencyContactPhone
          },
          allergies: patient.allergies,
          criticalNotes: patient.medicalHistory?.criticalNotes || null
        }

      default:
        return null
    }
  }

  /**
   * Check if user can create consultation for patient (cross-tenant)
   */
  static async canCreateConsultation(
    userId: number,
    patientId: number
  ): Promise<boolean> {
    const user = await User.find(userId)
    const patient = await Patient.find(patientId)

    if (!user || !patient) return false

    // Same tenant - check normal permissions
    if (user.tenantId === patient.tenantId) {
      return await user.hasPermission('consultation.create')
    }

    // Cross-tenant - check if user has QR scan permission and medical role
    const hasQrPermission = await user.hasPermission('patient.qr_scan')
    const isMedicalStaff = await user.isMedicalStaff()

    return hasQrPermission && isMedicalStaff
  }

  /**
   * Log cross-tenant access for audit
   */
  private static async logCrossTenantAccess(data: {
    scannerId: number
    patientId: number
    accessLevel: string
    scannerTenantId: number | null
    patientTenantId: number | null
  }) {
    // Implementation would log to audit table
    console.log('Cross-tenant access:', data)
  }

  /**
   * Generate emergency access token
   */
  static async generateEmergencyAccess(
    patientId: number,
    grantedBy: number,
    reason: string,
    durationHours: number = 24
  ): Promise<string> {
    // Implementation for emergency access tokens
    // This would create a temporary access token for emergency situations
    return 'emergency_token_' + Date.now()
  }
}