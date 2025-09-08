import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class SimpleUserRolesSeeder extends BaseSeeder {
  async run() {
    console.log('🔧 Assigning user roles...')

    // Clear existing user roles
    await Database.rawQuery('DELETE FROM user_roles')

    // Get users and roles
    const users = await Database.from('users').select('id', 'email', 'tenant_id')
    const roles = await Database.from('roles').select('id', 'name')

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

    console.log(`Found ${users.length} users and ${roles.length} roles`)
    console.log('Available roles:', roles.map(r => r.name).join(', '))
    
    for (const user of users) {
      const roleName = roleMap[user.email as keyof typeof roleMap]
      console.log(`Processing user: ${user.email} -> role: ${roleName}`)
      
      if (roleName) {
        const role = roles.find(r => r.name === roleName)
        if (role) {
          await Database.table('user_roles').insert({
            user_id: user.id,
            role_id: role.id,
            tenant_id: user.tenant_id,
            assigned_at: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
            is_active: true,
            created_at: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
            updated_at: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
          })
          console.log(`  ✅ Assigned ${roleName} to ${user.email}`)
        } else {
          console.log(`  ❌ Role ${roleName} not found for ${user.email}`)
          console.log(`    Available roles: ${roles.map(r => r.name).join(', ')}`)
        }
      } else {
        console.log(`  ⚠️  No role mapping for ${user.email}`)
      }
    }

    console.log('✅ User roles assigned successfully')
  }
}