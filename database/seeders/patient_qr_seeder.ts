import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Patient from '#models/patient'
import PatientQr from '#models/patient_qr'

export default class PatientQrSeeder extends BaseSeeder {
  async run() {
    console.log('  📱 Generating QR codes for patients...')
    
    // Get all active patients
    const patients = await Patient.query()
      .where('is_active', true)
      .limit(10) // Limit for demo
    
    let qrCount = 0
    
    for (const patient of patients) {
      try {
        // Check if patient already has QR code
        const existingQr = await PatientQr.query()
          .where('patient_id', patient.id)
          .where('is_active', true)
          .first()
        
        if (!existingQr) {
          await PatientQr.generateForPatient(patient.id)
          qrCount++
        }
      } catch (error) {
        console.log(`⚠️  Failed to generate QR for patient ${patient.id}: ${error.message}`)
      }
    }
    
    console.log(`✅ Generated ${qrCount} QR codes for patients`)
  }
}