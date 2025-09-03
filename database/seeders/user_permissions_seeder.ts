import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    console.log('  🔑 Seeding user permissions...')
    
    // Récupérer quelques utilisateurs spéciaux et permissions
    const users = await db.from('users').select('*').where('role', 'admin')
    const permissions = await db.from('permissions').select('*')
    
    console.log(`Found ${users.length} admin users, ${permissions.length} permissions`)

    // Créer quelques permissions directes pour les administrateurs principaux
    const userPermissionsToCreate = []
    
    // Donner des permissions spéciales aux admins principaux
    for (const user of users.slice(0, 2)) { // Premiers 2 admins
      
      // Permissions spéciales pour certains admins
      const specialPermissions = [
        'system.manage_roles',
        'reports.export_identified',
        'patients.delete'
      ]
      
      for (const permName of specialPermissions) {
        const permission = permissions.find(p => p.name === permName)
        if (permission) {
          userPermissionsToCreate.push({
            user_id: user.id,
            permission_id: permission.id,
            tenant_id: user.tenant_id,
            granted_by: 1, // Système
            granted_at: new Date(),
            grant_reason: 'Special admin privileges',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          })
        }
      }
    }

    // Ajouter quelques permissions temporaires pour des utilisateurs spécifiques
    const doctorUsers = await db.from('users').select('*').where('role', 'doctor').limit(1)
    
    if (doctorUsers.length > 0) {
      const emergencyPermissions = ['emergency.override_restrictions']
      
      for (const permName of emergencyPermissions) {
        const permission = permissions.find(p => p.name === permName)
        if (permission) {
          userPermissionsToCreate.push({
            user_id: doctorUsers[0].id,
            permission_id: permission.id,
            tenant_id: doctorUsers[0].tenant_id,
            granted_by: 1,
            granted_at: new Date(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
            grant_reason: 'Temporary emergency override for special cases',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          })
        }
      }
    }

    if (userPermissionsToCreate.length > 0) {
      await db.table('user_permissions').insert(userPermissionsToCreate)
      console.log(`✅ Created ${userPermissionsToCreate.length} direct user permissions`)
      
      // Afficher un résumé
      const permissionSummary = userPermissionsToCreate.reduce((acc, up) => {
        const permission = permissions.find(p => p.id === up.permission_id)
        if (permission) {
          acc[permission.display_name] = (acc[permission.display_name] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
      
      console.log('📊 Direct permissions summary:')
      for (const [permName, count] of Object.entries(permissionSummary)) {
        console.log(`   - ${permName}: ${count} users`)
      }
    } else {
      console.log('ℹ️  No direct user permissions created (using role-based permissions)')
    }
    
    console.log('✅ User permissions seeded successfully')
  }
}