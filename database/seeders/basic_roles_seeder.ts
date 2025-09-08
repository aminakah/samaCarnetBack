import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'

import Permission from '#models/permission'
import RolePermission from '#models/role_permission'

export default class extends BaseSeeder {
  async run() {
    // Créer les rôles système de base
    const roles = await Role.createMany([
      {
        name: 'super_admin',
        displayName: 'Super Administrateur',
        description: 'Rôle super administrateur avec accès complet'
      },
      {
        name: 'personnel',
        displayName: 'Personnel Médical',
        description: 'Rôle pour le personnel médical'
      },
      {
        name: 'patient',
        displayName: 'Patient',
        description: 'Rôle pour les patients'
      }
    ])

    // Récupérer toutes les permissions
    const permissions = await Permission.all()

    // Assigner toutes les permissions au rôle admin
    const adminRole = roles.find(r => r.name === 'admin')
    if (adminRole) {
      for (const permission of permissions) {
        await RolePermission.create({
          roleId: adminRole.id,
          permissionId: permission.id
        })
      }
    }

    console.log('✅ Roles seeded successfully')
  }
}