import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SuperAdmin from '#models/super_admin'
import User from '#models/user'
import Role from '#models/role'

export default class SuperAdminsSeeder extends BaseSeeder {
  async run() {
    console.log('  🔑 Seeding super admins...')
    
    // Get admin role
    const adminRole = await Role.findBy('name', 'admin')
    
    // Find admin users
    const adminUsers = await User.query().where('role_id', adminRole!.id)
    
    // Create super admin records for admin users
    for (const user of adminUsers) {
      await SuperAdmin.create({
        userId: user.id,
        accessLevel: 'full',
        notes: 'System super administrator'
      })
    }

    console.log('✅ Super admins seeded successfully')
  }
}