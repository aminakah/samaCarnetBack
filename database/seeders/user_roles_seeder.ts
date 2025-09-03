import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    console.log('  👤 Seeding user roles...')
    
    // Récupérer tous les utilisateurs et rôles
    const users = await db.from('users').select('*')
    const roles = await db.from('roles').select('*')
    
    console.log(`Found ${users.length} users, ${roles.length} roles`)

    // Mapper les rôles utilisateurs aux rôles système
    const userRoleMapping = {
      'admin': ['directeur_medical', 'super_admin'],
      'doctor': ['medecin_generaliste', 'gyneco_obstetricien', 'pediatre'],
      'midwife': ['sage_femme', 'sage_femme_senior'],
      'nurse': ['infirmier'],
      'patient': [] // Les patients n'ont pas de rôles système
    }

    const userRolesToCreate = []
    
    for (const user of users) {
      const possibleRoles = userRoleMapping[user.role as keyof typeof userRoleMapping] || []
      
      if (possibleRoles.length > 0) {
        // Pour chaque utilisateur, assigner le premier rôle correspondant
        // Pour les admins, assigner directeur_medical et super_admin selon le tenant
        let rolesToAssign = []
        
        if (user.role === 'admin') {
          // Premier admin de chaque tenant = directeur médical
          // Dernier admin (demo) = super admin aussi  
          rolesToAssign.push('directeur_medical')
          if (user.tenant_id === 4) { // Tenant demo
            rolesToAssign.push('super_admin')
          }
        } else if (user.role === 'doctor') {
          // Assigner des rôles spécialisés selon les spécialités
          if (user.specialties && user.specialties.includes('Gynécologie')) {
            rolesToAssign.push('gyneco_obstetricien')
          } else if (user.specialties && user.specialties.includes('Pédiatrie')) {
            rolesToAssign.push('pediatre')  
          } else {
            rolesToAssign.push('medecin_generaliste')
          }
        } else if (user.role === 'midwife') {
          // Assigner sage_femme ou sage_femme_senior selon l'expérience
          const randomLevel = Math.random()
          rolesToAssign.push(randomLevel > 0.7 ? 'sage_femme_senior' : 'sage_femme')
        } else {
          // Pour les autres, prendre le premier rôle disponible
          rolesToAssign.push(possibleRoles[0])
        }

        // Créer les assignations
        for (const roleName of rolesToAssign) {
          const role = roles.find(r => r.name === roleName)
          if (role) {
            userRolesToCreate.push({
              user_id: user.id,
              role_id: role.id,
              tenant_id: user.tenant_id,
              assigned_by: 1,
              assigned_at: new Date(),
              assignment_reason: 'Initial role assignment based on user type',
              is_active: true,
              is_primary: rolesToAssign.indexOf(roleName) === 0, // Premier rôle = primaire
              created_at: new Date(),
              updated_at: new Date()
            })
          }
        }
      }
    }

    if (userRolesToCreate.length > 0) {
      await db.table('user_roles').insert(userRolesToCreate)
      console.log(`✅ Created ${userRolesToCreate.length} user-role assignments`)
      
      // Afficher un résumé par rôle
      const roleAssignments = userRolesToCreate.reduce((acc, ur) => {
        const role = roles.find(r => r.id === ur.role_id)
        if (role) {
          acc[role.display_name] = (acc[role.display_name] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
      
      console.log('📊 Assignments summary:')
      for (const [roleName, count] of Object.entries(roleAssignments)) {
        console.log(`   - ${roleName}: ${count} users`)
      }
    }
    
    console.log('✅ User roles seeded successfully')
  }
}