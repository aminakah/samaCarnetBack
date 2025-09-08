import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Permission from '#models/permission'
import UserPermission from '#models/user_permission'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    console.log('  🔑 Seeding special user permissions...')
    
    // Get admin users with their roles
    const adminUsers = await User.query()
      .whereHas('userRoles', (query) => {
        query.whereHas('role', (roleQuery) => {
          roleQuery.where('name', 'tenant_admin')
        })
      })
      .limit(2)
    
    if (adminUsers.length === 0) {
      console.log('ℹ️  No admin users found, skipping special permissions')
      return
    }

    // Special permissions for super admins
    const specialPermissions = [
      'admin.system_config',
      'reports.export'
    ]

    let createdCount = 0
    
    for (const user of adminUsers) {
      for (const permName of specialPermissions) {
        const permission = await Permission.findBy('name', permName)
        if (permission) {
          await UserPermission.create({
            userId: user.id,
            permissionId: permission.id,
            tenantId: user.tenantId,
            grantedBy: 1,
            grantedAt: DateTime.now(),
            grantReason: 'Special admin privileges',
            isActive: true
          })
          createdCount++
        }
      }
    }
    
    console.log(`✅ Created ${createdCount} special user permissions`)
  }
}