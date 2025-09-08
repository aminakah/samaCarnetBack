import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MedicalHistory from '#models/medical_history'
import Patient from '#models/patient'
import { DateTime } from 'luxon'

export default class MedicalHistoriesSeeder extends BaseSeeder {
  async run() {
    console.log('  🏥 Seeding medical histories...')
    
    const patients = await Patient.all()
    
    for (const patient of patients) {
      // Create sample medical histories for each patient
      await MedicalHistory.createMany([
        {
          patientId: patient.id,
          type: 'allergy',
          title: 'Allergie à la pénicilline',
          description: 'Réaction allergique modérée à la pénicilline',
          severity: 'medium',
          dateRecorded: DateTime.now().minus({ months: 6 }),
          isActive: true
        },
        {
          patientId: patient.id,
          type: 'condition',
          title: 'Hypertension',
          description: 'Hypertension artérielle légère',
          severity: 'low',
          dateRecorded: DateTime.now().minus({ years: 1 }),
          isActive: true
        },
        {
          patientId: patient.id,
          type: 'family_history',
          title: 'Diabète familial',
          description: 'Antécédents familiaux de diabète type 2',
          severity: 'medium',
          dateRecorded: DateTime.now().minus({ months: 3 }),
          isActive: true
        }
      ])
    }

    console.log('✅ Medical histories seeded successfully')
  }
}