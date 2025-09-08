import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import UserRole from '#models/user_role'
import { DateTime } from 'luxon'

export default class UsersSeeder extends BaseSeeder {
  async run() {
    console.log('  👥 Seeding users...')
    
    const users = [
      // Super Admin Global
      {
        tenantId: null, // Super admin n'appartient à aucun tenant spécifique
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@samacarnet.sn',
        password: 'password123',
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
        password: 'password123',
        phone: '+221 77 234 56 78',
        gender: 'male' as const,
        licenseNumber: 'SN-DR-2024-001',
        specialties: ['Gynecologie', 'Obstetrique'],
        bio: 'Gynecologue-obstetricien avec 15 ans d experience au Senegal',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Fatou',
        lastName: 'Ba',
        email: 'fatou.ba@dakar-health.sn',
        password: 'password123',
        phone: '+221 77 345 67 89',
        gender: 'female' as const,
        licenseNumber: 'SN-SF-2024-001',
        specialties: ['Sage-femme', 'Vaccination', 'Consultation prenatale'],
        bio: 'Sage-femme certifiee, specialisee en vaccination et suivi prenatal',
        preferredLanguage: 'wo',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Aïcha',
        lastName: 'Ndiaye',
        email: 'aicha.ndiaye@gmail.com',
        password: 'password123',
        phone: '+221 77 456 78 90',
        dateOfBirth: DateTime.fromObject({ year: 1992, month: 3, day: 15 }),
        gender: 'female' as const,
        address: 'Medina, Dakar, Senegal',
        emergencyContactName: 'Ousmane Ndiaye',
        emergencyContactPhone: '+221 77 567 89 01',
        medicalHistory: {
          allergies: ['Penicilline'],
          conditions: ['Aucune condition chronique'],
          surgeries: ['Appendicectomie 2018'],
          bloodType: 'O+'
        },
        preferredLanguage: 'wo',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Khadija',
        lastName: 'Thiam',
        email: 'khadija.thiam@gmail.com',
        password: 'password123',
        phone: '+221 77 567 89 01',
        dateOfBirth: DateTime.fromObject({ year: 1988, month: 7, day: 22 }),
        gender: 'female' as const,
        address: 'Parcelles Assainies, Dakar, Senegal',
        emergencyContactName: 'Ibrahim Thiam',
        emergencyContactPhone: '+221 77 678 90 12',
        medicalHistory: {
          allergies: [],
          conditions: ['Hypertension familiale'],
          surgeries: [],
          bloodType: 'A+'
        },
        preferredLanguage: 'fr',
        status: 'active' as const
      },

      // Demo tenant users
      {
        tenantId: 1,
        firstName: 'Dr. Fatou',
        lastName: 'Seck',
        email: 'fatou.seck@demo.com',
        password: 'password123',
        phone: '+221 77 000 00 02',
        gender: 'female' as const,
        licenseNumber: 'SN-DEMO-DR-001',
        specialties: ['Gynecologie', 'Obstetrique'],
        bio: 'Medecin de demonstration',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Awa',
        lastName: 'Ndiaye',
        email: 'awa.ndiaye@demo.com',
        password: 'password123',
        phone: '+221 77 000 00 03',
        gender: 'female' as const,
        licenseNumber: 'SN-DEMO-SF-001',
        specialties: ['Sage-femme', 'Vaccination'],
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Aminata',
        lastName: 'Diallo',
        email: 'aminata.diallo@demo.com',
        password: 'password123',
        phone: '+221 77 000 00 04',
        dateOfBirth: DateTime.fromObject({ year: 1995, month: 1, day: 1 }),
        gender: 'female' as const,
        address: 'Dakar, Senegal',
        emergencyContactName: 'Contact Urgence',
        emergencyContactPhone: '+221 77 000 00 05',
        medicalHistory: {
          allergies: [],
          conditions: [],
          surgeries: [],
          bloodType: 'B+'
        },
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        tenantId: 1,
        firstName: 'Khadija',
        lastName: 'Ba',
        email: 'khadija.ba@demo.com',
        password: 'password123',
        phone: '+221 77 000 00 05',
        dateOfBirth: DateTime.fromObject({ year: 1990, month: 6, day: 15 }),
        gender: 'female' as const,
        address: 'Dakar, Senegal',
        emergencyContactName: 'Contact Urgence',
        emergencyContactPhone: '+221 77 000 00 06',
        medicalHistory: {
          allergies: [],
          conditions: [],
          surgeries: [],
          bloodType: 'A+'
        },
        preferredLanguage: 'fr',
        status: 'active' as const
      }
    ]

    // Create users and assign roles
    const roleMap = {
      'superadmin@samacarnet.sn': 'super_admin',
      'mamadou.seck@dakar-health.sn': 'doctor', 
      'fatou.ba@dakar-health.sn': 'midwife',
      'aicha.ndiaye@gmail.com': 'patient',
      'khadija.thiam@gmail.com': 'patient',
      'fatou.seck@demo.com': 'doctor',
      'awa.ndiaye@demo.com': 'midwife',
      'aminata.diallo@demo.com': 'patient',
      'khadija.ba@demo.com': 'patient'
    }

    for (const userData of users) {
      const user = await User.create({ ...userData, version: 1 })
      
      // Assign role to user
      const roleName = roleMap[userData.email as keyof typeof roleMap]
      if (roleName) {
        const role = await Role.findBy('name', roleName)
        if (role) {
          await UserRole.create({
            userId: user.id,
            roleId: role.id,
            tenantId: user.tenantId,
            assignedAt: DateTime.now(),
            isActive: true
          })
        }
      }
    }
  }
}