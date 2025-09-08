import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import UserRole from '#models/user_role'
import { DateTime } from 'luxon'

export default class FixUserRolesSeeder extends BaseSeeder {
  async run() {
    console.log('🔧 Fixing user roles assignments...')

    // Mapping des emails vers les rôles
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

    // Supprimer les anciennes assignations
    await UserRole.query().delete()

    // Assigner les rôles
    for (const [email, roleName] of Object.entries(roleMap)) {
      const user = await User.findBy('email', email)
      const role = await Role.findBy('name', roleName)
      
      if (user && role) {
        await UserRole.create({
          userId: user.id,
          roleId: role.id,
          tenantId: user.tenantId,
          assignedAt: DateTime.now(),
          isActive: true
        })
        console.log(`  ✅ Assigned role ${roleName} to ${email}`)
      } else {
        console.log(`  ⚠️  User ${email} or role ${roleName} not found`)
      }
    }

    console.log('✅ User roles fixed successfully')
  }
}