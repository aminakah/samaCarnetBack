import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Patient from '#models/patient'
import Personnel from '#models/personnel'
import User from '#models/user'
import TypePersonnel from '#models/type_personnel'

export default class extends BaseSeeder {
  async run() {
    console.log('  👥 Seeding patients and personnel...')
    
    // Récupérer tous les utilisateurs et types de personnel
    const users = await User.all()
    const typePersonnels = await TypePersonnel.all()
    
    console.log(`Found ${users.length} users, ${typePersonnels.length} personnel types`)

    // Créer des patients basés sur les utilisateurs ayant le rôle 'patient'
    const patientUsers = users.filter(user => user.role === 'patient')
    const patients = []
    
    for (const user of patientUsers) {
      patients.push({
        tenantId: user.tenantId,
        userId: user.id,
        patientNumber: `PAT-${String(user.id).padStart(6, '0')}`,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        phone: user.phone,
        email: user.email,
        address: user.address,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        bloodType: user.medicalHistory?.bloodType || null,
        allergies: user.medicalHistory?.allergies || [],
        chronicConditions: user.medicalHistory?.conditions || [],
        medicalHistory: user.medicalHistory || {},
        status: 'active',
        createdBy: 1,
        isActive: true
      })
    }

    if (patients.length > 0) {
      await Patient.createMany(patients)
      console.log(`✅ Created ${patients.length} patients`)
    }

    // Créer des enregistrements personnel pour les utilisateurs non-patients
    const staffUsers = users.filter(user => user.role !== 'patient')
    const personnel = []
    
    for (const user of staffUsers) {
      // Trouver le type de personnel basé sur le rôle
      let typePersonnel = null
      
      switch (user.role) {
        case 'admin':
          typePersonnel = typePersonnels.find(tp => tp.name === 'directeur_medical')
          break
        case 'doctor':
          if (user.specialties?.includes('Gynécologie')) {
            typePersonnel = typePersonnels.find(tp => tp.name === 'gyneco_obstetricien')
          } else if (user.specialties?.includes('Pédiatrie')) {
            typePersonnel = typePersonnels.find(tp => tp.name === 'pediatre')
          } else {
            typePersonnel = typePersonnels.find(tp => tp.name === 'medecin_generaliste')
          }
          break
        case 'midwife':
          typePersonnel = typePersonnels.find(tp => tp.name === 'sage_femme')
          break
        case 'midwife': // Note: 'nurse' role doesn't exist in User model, using 'midwife' as fallback
          typePersonnel = typePersonnels.find(tp => tp.name === 'infirmier')
          break
        default:
          typePersonnel = typePersonnels.find(tp => tp.name === 'secretaire_medicale')
      }

      if (typePersonnel) {
        personnel.push({
          tenantId: user.tenantId,
          userId: user.id,
          typePersonnelId: typePersonnel.id,
          personnelNumber: `PERS-${String(user.id).padStart(6, '0')}`,
          licenseNumber: user.licenseNumber || null,
          specializations: user.specialties || [],
          experienceYears: Math.floor(Math.random() * 20) + 1,
          startDate: new Date(),
          status: 'active',
          isActive: true,
          createdBy: 1
        })
      }
    }

    if (personnel.length > 0) {
      await Personnel.createMany(personnel)
      console.log(`✅ Created ${personnel.length} personnel records`)
    }
    
    console.log('✅ Patients and personnel seeded successfully')
  }
}