import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Tenant from '#models/tenant'
import User from '#models/user'
import VaccineType from '#models/vaccine_type'
import { DateTime } from 'luxon'

export default class DemoSeeder extends BaseSeeder {
  async run() {
    console.log('🌱 Seeding demo data...')

    // Create only the Demo tenant and essential data
    await this.seedDemoTenant()
    await this.seedDemoUsers()
    await this.seedEssentialVaccines()

    console.log('✅ Demo data seeded successfully!')
    console.log('')
    console.log('🔑 Demo credentials:')
    console.log('📋 Tenant: demo (x-tenant-id: 1)')
    console.log('   👑 Admin: admin@demo.sn / Admin123!')
    console.log('   👨‍⚕️ Doctor: doctor@demo.sn / Doctor123!')
    console.log('   👩‍⚕️ Midwife: midwife@demo.sn / Midwife123!')
    console.log('   🤰 Patient: patient@demo.sn / Patient123!')
    console.log('')
    console.log('📊 Demo data includes:')
    console.log('   • 1 Demo tenant')
    console.log('   • 4 Demo users (one per role)')
    console.log('   • 3 Essential vaccine types')
    console.log('   • Ready for testing basic functionality')
  }

  private async seedDemoTenant() {
    console.log('  📋 Creating demo tenant...')
    
    const tenant = {
      name: 'Clinique Démo Sénégal',
      subdomain: 'demo',
      domain: null,
      email: 'contact@demo.sn',
      phone: '+221 33 123 45 67',
      address: 'Dakar, Sénégal',
      settings: JSON.stringify({
        language: 'fr',
        timezone: 'Africa/Dakar',
        features: ['pregnancies', 'vaccinations', 'consultations'],
        demoMode: true,
        workingHours: '08:00-17:00',
        appointmentDuration: 30
      }),
      status: 'active' as const,
      subscriptionPlan: 'basic' as const
    }

    await Tenant.create(tenant)
  }

  private async seedDemoUsers() {
    console.log('  👥 Creating demo users...')
    
    const users = [
      {
        tenantId: 1,
        firstName: 'Admin',
        lastName: 'Demo',
        email: 'admin@demo.sn',
        password: 'Admin123!',
        role: 'admin' as const,
        phone: '+221 77 000 00 01',
        gender: 'female',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Dr. Médecin',
        lastName: 'Demo',
        email: 'doctor@demo.sn',
        password: 'Doctor123!',
        role: 'doctor' as const,
        phone: '+221 77 000 00 02',
        gender: 'male' as const,
        licenseNumber: 'SN-DEMO-DR-001',
        specialties: JSON.stringify(['Gynécologie', 'Obstétrique', 'Médecine générale']),
        bio: 'Médecin de démonstration pour tests',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Sage-femme',
        lastName: 'Demo',
        email: 'midwife@demo.sn',
        password: 'Midwife123!',
        role: 'midwife' as const,
        phone: '+221 77 000 00 03',
        gender: 'female' as const,
        licenseNumber: 'SN-DEMO-SF-001',
        specialties: JSON.stringify(['Sage-femme', 'Vaccination']),
        bio: 'Sage-femme de démonstration',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Patiente',
        lastName: 'Demo',
        email: 'patient@demo.sn',
        password: 'Patient123!',
        role: 'patient' as const,
        phone: '+221 77 000 00 04',
        dateOfBirth: DateTime.fromObject({ year: 1995, month: 1, day: 1 }),
        gender: 'female' as const,
        address: 'Dakar, Sénégal',
        emergencyContactName: 'Contact Urgence Demo',
        emergencyContactPhone: '+221 77 000 00 05',
        medicalHistory: JSON.stringify({
          allergies: [],
          conditions: [],
          surgeries: [],
          bloodType: 'O+'
        }),
        preferredLanguage: 'fr',
        status: 'active' as const
      }
    ]

    await User.createMany(users)
  }

  private async seedEssentialVaccines() {
    console.log('  💉 Creating essential vaccine types...')
    
    const vaccines = [
      {
        name: 'VAT (Tétanos Maternel)',
        description: 'Vaccin antitétanique pour femmes enceintes',
        manufacturer: 'Demo Pharmaceuticals',
        category: 'grossesse',
        ageRecommendations: JSON.stringify({
          minAge: 15,
          maxAge: 49,
          unit: 'years',
          schedule: '2 doses pendant la grossesse'
        }),
        contraindications: JSON.stringify(['Allergie aux composants']),
        sideEffects: JSON.stringify(['Douleur locale mineure']),
        dosageInstructions: 'Injection intramusculaire 0.5ml',
        storageRequirements: 'Conserver entre 2-8°C',
        batchTrackingRequired: true,
        isActive: true
      },
      {
        name: 'BCG (Tuberculose)',
        description: 'Vaccin contre la tuberculose',
        manufacturer: 'Demo Pharmaceuticals',
        category: 'enfant',
        ageRecommendations: JSON.stringify({
          minAge: 0,
          maxAge: 12,
          unit: 'months',
          schedule: 'À la naissance'
        }),
        contraindications: JSON.stringify(['Immunodéficience']),
        sideEffects: JSON.stringify(['Réaction locale normale']),
        dosageInstructions: 'Injection intradermique 0.1ml',
        storageRequirements: 'Conserver entre 2-8°C',
        batchTrackingRequired: true,
        isActive: true
      },
      {
        name: 'Pentavalent',
        description: 'Vaccin 5-en-1 pour enfants',
        manufacturer: 'Demo Pharmaceuticals',
        category: 'enfant',
        ageRecommendations: JSON.stringify({
          minAge: 6,
          maxAge: 18,
          unit: 'months',
          schedule: '6, 10, 14 semaines'
        }),
        contraindications: JSON.stringify(['Maladie fébrile aiguë']),
        sideEffects: JSON.stringify(['Fièvre légère possible']),
        dosageInstructions: 'Injection intramusculaire 0.5ml',
        storageRequirements: 'Conserver entre 2-8°C',
        batchTrackingRequired: true,
        isActive: true
      }
    ]

    await VaccineType.createMany(vaccines)
  }
}