import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import Patient from '#models/patient'
import Personnel from '#models/personnel'
import SuperAdmin from '#models/super_admin'
import { DateTime } from 'luxon'
import TypePersonnel from '#models/type_personnel'
import Tenant from '#models/tenant'

export default class UsersSeeder extends BaseSeeder {
  async run() {
    console.log('  👥 Seeding users...')
    
    // Get roles first
    const adminRole = await Role.findBy('name', 'super_admin')
    const personnelRole = await Role.findBy('name', 'personnel')
    const patientRole = await Role.findBy('name', 'patient')
    const typePersonnels=await TypePersonnel.query()
    const tenants=await Tenant.query()
   
     

    const users = [
      // Admin
      {
        roleId: adminRole!.id,
        firstName: 'Super Admin',
        lastName: 'System',
        email: 'superadmin@samacarnet.sn',
        password: 'password123',
        phone: '+221 77 123 45 67',
        gender: 'female' as const,
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      
      // Personnel - Tenant 1
      {
        roleId: personnelRole!.id,
        firstName: 'Dr. Fatou',
        lastName: 'Seck',
        email: 'fatou.seck@tenant1.com',
        password: 'password123',
        phone: '+221 77 000 00 02',
        gender: 'female' as const,
        preferredLanguage: 'fr',
        status: 'active' as const,
       
      },
      {
        roleId: personnelRole!.id,
        firstName: 'Awa',
        lastName: 'Ndiaye',
        email: 'awa.ndiaye@tenant1.com',
        password: 'password123',
        phone: '+221 77 000 00 03',
        gender: 'female' as const,
        preferredLanguage: 'fr',
        status: 'active' as const,
       
      },
      
      // Personnel - Tenant 2
      {
        roleId: personnelRole!.id,
        firstName: 'Dr. Moussa',
        lastName: 'Fall',
        email: 'moussa.fall@tenant2.com',
        password: 'password123',
        phone: '+221 77 000 00 06',
        gender: 'male' as const,
        preferredLanguage: 'fr',
        status: 'active' as const,
      
      },
      {
        roleId: personnelRole!.id,
        firstName: 'Mariama',
        lastName: 'Sy',
        email: 'mariama.sy@tenant2.com',
        password: 'password123',
        phone: '+221 77 000 00 07',
        gender: 'female' as const,
        preferredLanguage: 'wo',
        status: 'active' as const,
      
      },
      
      // Personnel - Tenant 3
      {
        roleId: personnelRole!.id,
        firstName: 'Dr. Ousmane',
        lastName: 'Diop',
        email: 'ousmane.diop@tenant3.com',
        password: 'password123',
        phone: '+221 77 000 00 08',
        gender: 'male' as const,
        preferredLanguage: 'fr',
        status: 'active' as const,
       
      },
      
      // Patients
      {
        roleId: patientRole!.id,
        firstName: 'Aminata',
        lastName: 'Diallo',
        email: 'aminata.diallo@patient.com',
        password: 'password123',
        phone: '+221 77 000 00 04',
        dateOfBirth: DateTime.fromObject({ year: 1995, month: 1, day: 1 }),
        gender: 'female' as const,
        address: 'Dakar, Senegal',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        roleId: patientRole!.id,
        firstName: 'Khadija',
        lastName: 'Ba',
        email: 'khadija.ba@patient.com',
        password: 'password123',
        phone: '+221 77 000 00 05',
        dateOfBirth: DateTime.fromObject({ year: 1990, month: 6, day: 15 }),
        gender: 'female' as const,
        address: 'Dakar, Senegal',
        preferredLanguage: 'fr',
        status: 'active' as const
      },
      {
        roleId: patientRole!.id,
        firstName: 'Ibrahima',
        lastName: 'Sarr',
        email: 'ibrahima.sarr@patient.com',
        password: 'password123',
        phone: '+221 77 000 00 09',
        dateOfBirth: DateTime.fromObject({ year: 1988, month: 8, day: 20 }),
        gender: 'male' as const,
        address: 'Thiès, Senegal',
        preferredLanguage: 'wo',
        status: 'active' as const
      },
      {
        roleId: patientRole!.id,
        firstName: 'Aissatou',
        lastName: 'Cissé',
        email: 'aissatou.cisse@patient.com',
        password: 'password123',
        phone: '+221 77 000 00 10',
        dateOfBirth: DateTime.fromObject({ year: 1992, month: 3, day: 12 }),
        gender: 'female' as const,
        address: 'Saint-Louis, Senegal',
        preferredLanguage: 'fr',
        status: 'active' as const
      }
    ]

    // Create users and related records
    for (const userData of users) {
      const user = await User.create({ ...userData, version: 1 })
      
      // Create patient record if user is patient
      if (user.roleId === patientRole!.id) {
        await Patient.create({
          patientNumber: `PAT-${String(user.id).padStart(6, '0')}`,
          nationalId: `SN${String(user.id).padStart(8, '0')}`,
          city: 'Dakar',
          region: 'Dakar',
          emergencyContactName: 'Contact Urgence',
          emergencyContactPhone: '+221 77 000 00 00',
          bloodType: 'O+',
          allergies: [],
          medicalHistory: {},
          currentMedications: []
        })
      }
      
      // Create personnel record if user is personnel
      if (user.roleId === personnelRole!.id) {
        const tenantId = tenants[(Math.floor(Math.random() * tenants.length))]
        const randomType = typePersonnels[Math.floor(Math.random() * typePersonnels.length)]
        await Personnel.create({
          tenantId: tenantId.id,
          userId: user.id,
          typePersonnelId: randomType?.id , 
          licenseNumber: `LIC-${user.id}`,
          specialties: ['General'],
          bio: 'Personnel médical',
          hireDate: DateTime.now(),
          contractType: 'CDI',
          isOnDuty: true
        })
      }
      
      // Create super admin record if user is admin
      if (user.roleId === adminRole!.id) {
        await SuperAdmin.create({
          userId: user.id,
          accessLevel: 'full',
          notes: 'System super administrator'
        })
      }
    }

    console.log('✅ Users seeded successfully')
  }
}