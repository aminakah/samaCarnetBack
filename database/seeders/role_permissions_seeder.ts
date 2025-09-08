import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import Permission from '#models/permission'
import RolePermission from '#models/role_permission'

export default class RolePermissionsSeeder extends BaseSeeder {
  async run() {
    console.log('  🔗 Seeding role permissions...')
    
    const adminRole = await Role.findBy('name', 'admin')
    const permissions = await Permission.all()
    
    // Assign all permissions to admin role
    if (adminRole) {
      for (const permission of permissions) {
        await RolePermission.create({
          roleId: adminRole.id,
          permissionId: permission.id
        })
      }
    }

    console.log('✅ Role permissions seeded successfully')
  }
}