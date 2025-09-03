import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class UsersSeeder extends BaseSeeder {
  async run() {
    console.log('  👥 Seeding users...')
    
    const users = [
      // Tenant 1 - Centre de Santé Dakar
      {
        tenantId: 1,
        firstName: 'Aminata',
        lastName: 'Diallo',
        email: 'admin@dakar-health.sn',
        password: 'Admin123!',
        role: 'admin' as const,
        phone: '+221 77 123 45 67',
        gender: 'female' as const,
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Dr. Mamadou',
        lastName: 'Seck',
        email: 'mamadou.seck@dakar-health.sn',
        password: 'Doctor123!',
        role: 'doctor' as const,
        phone: '+221 77 234 56 78',
        gender: 'male' as const,
        licenseNumber: 'SN-DR-2024-001',
        specialties: JSON.stringify(['Gynécologie', 'Obstétrique']),
        bio: 'Gynécologue-obstétricien avec 15 ans d\'expérience au Sénégal',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Fatou',
        lastName: 'Ba',
        email: 'fatou.ba@dakar-health.sn',
        password: 'Midwife123!',
        role: 'midwife' as const,
        phone: '+221 77 345 67 89',
        gender: 'female' as const,
        licenseNumber: 'SN-SF-2024-001',
        specialties: JSON.stringify(['Sage-femme', 'Vaccination', 'Consultation prénatale']),
        bio: 'Sage-femme certifiée, spécialisée en vaccination et suivi prénatal',
        preferredLanguage: 'wo',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Aïcha',
        lastName: 'Ndiaye',
        email: 'aicha.ndiaye@gmail.com',
        password: 'Patient123!',
        role: 'patient' as const,
        phone: '+221 77 456 78 90',
        dateOfBirth: DateTime.fromObject({ year: 1992, month: 3, day: 15 }),
        gender: 'female' as const,
        address: 'Médina, Dakar, Sénégal',
        emergencyContactName: 'Ousmane Ndiaye',
        emergencyContactPhone: '+221 77 567 89 01',
        medicalHistory: JSON.stringify({
          allergies: ['Pénicilline'],
          conditions: ['Aucune condition chronique'],
          surgeries: ['Appendicectomie 2018'],
          bloodType: 'O+'
        }),
        preferredLanguage: 'wo',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Khadija',
        lastName: 'Thiam',
        email: 'khadija.thiam@gmail.com',
        password: 'Patient123!',
        role: 'patient' as const,
        phone: '+221 77 567 89 01',
        dateOfBirth: DateTime.fromObject({ year: 1988, month: 7, day: 22 }),
        gender: 'female' as const,
        address: 'Parcelles Assainies, Dakar, Sénégal',
        emergencyContactName: 'Ibrahim Thiam',
        emergencyContactPhone: '+221 77 678 90 12',
        medicalHistory: JSON.stringify({
          allergies: [],
          conditions: ['Hypertension familiale'],
          surgeries: [],
          bloodType: 'A+'
        }),
        preferredLanguage: 'fr',
        status: 'active' as const
      },

      // Tenant 2 - Clinique Almadies
      {
        tenantId: 2,
        firstName: 'Dr. Oumar',
        lastName: 'Faye',
        email: 'oumar.faye@almadies-clinic.sn',
        password: 'Admin123!',
        role: 'admin' as const,
        phone: '+221 77 789 01 23',
        gender: 'male' as const,
        licenseNumber: 'SN-DR-2024-002',
        specialties: JSON.stringify(['Médecine générale', 'Pédiatrie']),
        bio: 'Directeur médical avec expertise en pédiatrie',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 2,
        firstName: 'Mariama',
        lastName: 'Sy',
        email: 'mariama.sy@almadies-clinic.sn',
        password: 'Midwife123!',
        role: 'midwife' as const,
        phone: '+221 77 890 12 34',
        gender: 'female' as const,
        licenseNumber: 'SN-SF-2024-002',
        specialties: JSON.stringify(['Sage-femme', 'Soins néonataux']),
        bio: 'Sage-femme spécialisée en soins néonataux',
        preferredLanguage: 'fr',
        status: 'active' as const
      },

      // Tenant 3 - Hôpital Thiès
      {
        tenantId: 3,
        firstName: 'Dr. Ibrahima',
        lastName: 'Fall',
        email: 'ibrahima.fall@hopital-thies.sn',
        password: 'Doctor123!',
        role: 'doctor' as const,
        phone: '+221 77 111 22 33',
        gender: 'male' as const,
        licenseNumber: 'SN-DR-2024-003',
        specialties: JSON.stringify(['Obstétrique', 'Chirurgie générale']),
        bio: 'Chef de service obstétrique',
        preferredLanguage: 'wo',
        status: 'active' as const
      },

      // Tenant 4 - Demo
      {
        tenantId: 4,
        firstName: 'Admin',
        lastName: 'Demo',
        email: 'admin@demo.sn',
        password: 'Admin123!',
        role: 'admin' as const,
        phone: '+221 77 000 00 01',
        gender: 'female' as const,
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 4,
        firstName: 'Dr. Médecin',
        lastName: 'Demo',
        email: 'doctor@demo.sn',
        password: 'Doctor123!',
        role: 'doctor' as const,
        phone: '+221 77 000 00 02',
        gender: 'male' as const,
        licenseNumber: 'SN-DEMO-DR-001',
        specialties: JSON.stringify(['Gynécologie', 'Obstétrique', 'Médecine générale']),
        bio: 'Médecin de démonstration',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 4,
        firstName: 'Sage-femme',
        lastName: 'Demo',
        email: 'midwife@demo.sn',
        password: 'Midwife123!',
        role: 'midwife' as const,
        phone: '+221 77 000 00 03',
        gender: 'female' as const,
        licenseNumber: 'SN-DEMO-SF-001',
        specialties: JSON.stringify(['Sage-femme', 'Vaccination']),
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 4,
        firstName: 'Patiente',
        lastName: 'Demo',
        email: 'patient@demo.sn',
        password: 'Patient123!',
        role: 'patient' as const,
        phone: '+221 77 000 00 04',
        dateOfBirth: DateTime.fromObject({ year: 1995, month: 1, day: 1 }),
        gender: 'female' as const,
        address: 'Dakar, Sénégal',
        emergencyContactName: 'Contact Urgence',
        emergencyContactPhone: '+221 77 000 00 05',
        medicalHistory: JSON.stringify({
          allergies: [],
          conditions: [],
          surgeries: [],
          bloodType: 'B+'
        }),
        preferredLanguage: 'fr',
        status: 'active' as const
      }
    ]

    await User.createMany(users)
  }
}