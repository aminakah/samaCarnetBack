import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    console.log('  👥 Seeding patients and personnel (simple version)...')
    
    // Récupérer les utilisateurs et types de personnel
    const users = await db.from('users').select('*')
    const typePersonnels = await db.from('type_personnels').select('*')
    
    console.log(`Found ${users.length} users, ${typePersonnels.length} personnel types`)

    // Créer des patients (utilisateurs avec role = 'patient')
    const patientUsers = users.filter(user => user.role === 'patient')
    let patientsCreated = 0
    
    for (const user of patientUsers) {
      try {
        await db.table('patients').insert({
          tenant_id: user.tenant_id,
          patient_number: `PAT-${String(user.id).padStart(6, '0')}`,
          first_name: user.first_name,
          last_name: user.last_name,
          date_of_birth: user.date_of_birth,
          gender: user.gender,
          phone: user.phone,
          email: user.email,
          address: user.address,
          emergency_contact_name: user.emergency_contact_name,
          emergency_contact_phone: user.emergency_contact_phone,
          blood_type: 'O+',
          allergies: JSON.stringify([]),
          medical_history: JSON.stringify({}),
          current_medications: JSON.stringify([]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        })
        patientsCreated++
      } catch (error) {
        console.log(`⚠️  Skipped patient ${user.first_name} ${user.last_name}: ${error.message}`)
      }
    }

    // Créer des enregistrements personnel
    const staffUsers = users.filter(user => user.role !== 'patient')
    let personnelCreated = 0
    
    for (const user of staffUsers) {
      let typePersonnelId = null
      
      // Mapper les rôles aux types de personnel
      switch (user.role) {
        case 'admin':
          typePersonnelId = typePersonnels.find(tp => tp.name === 'directeur_medical')?.id
          break
        case 'doctor':
          typePersonnelId = typePersonnels.find(tp => tp.name === 'medecin_generaliste')?.id
          break
        case 'midwife':
          typePersonnelId = typePersonnels.find(tp => tp.name === 'sage_femme')?.id
          break
        default:
          typePersonnelId = typePersonnels.find(tp => tp.name === 'secretaire_medicale')?.id
      }

      if (typePersonnelId) {
        try {
          await db.table('personnel').insert({
            tenant_id: user.tenant_id,
            user_id: user.id,
            type_personnel_id: typePersonnelId,
            license_number: user.license_number || null,
            specialties: JSON.stringify([]),
            hire_date: new Date(),
            contract_type: 'CDI',
            is_active: true,
            is_on_duty: true,
            created_at: new Date(),
            updated_at: new Date()
          })
          personnelCreated++
        } catch (error) {
          console.log(`⚠️  Skipped personnel ${user.first_name} ${user.last_name}: ${error.message}`)
        }
      }
    }
    
    console.log(`✅ Created ${patientsCreated} patients`)
    console.log(`✅ Created ${personnelCreated} personnel records`)
    console.log('✅ Patients and personnel seeded successfully')
  }
}