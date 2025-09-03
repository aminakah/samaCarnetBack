import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Role from '#models/role'
import Permission from '#models/permission'
import RolePermission from '#models/role_permission'
import TypePersonnel from '#models/type_personnel'

export default class extends BaseSeeder {
  async run() {
    console.log('  🔐 Seeding roles (simplified version)...')
    
    // Récupérer les types de personnel
    const typePersonnels = await TypePersonnel.query()
      .preload('category')
      .preload('subcategory')

    console.log(`Found ${typePersonnels.length} personnel types`)

    // Créer les rôles système de base (sans metadata pour éviter les erreurs JSON)
    const roles = await Role.createMany([
      // RÔLES MÉDICAUX
      {
        tenantId: null,
        name: 'sage_femme_junior',
        displayName: 'Sage-femme Junior',
        description: 'Rôle pour sage-femme débutante',
        level: 1,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'sage_femme_junior')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'sage_femme',
        displayName: 'Sage-femme',
        description: 'Rôle pour sage-femme confirmée',
        level: 2,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'sage_femme')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'directeur_medical',
        displayName: 'Directeur Médical',
        description: 'Rôle pour directeur médical',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: true,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'directeur_medical')?.id || null,
        maxUsers: 1,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'super_admin',
        displayName: 'Super Administrateur',
        description: 'Rôle super admin',
        level: 5,
        isSystem: true,
        isMedical: false,
        isAdministrative: true,
        typePersonnelId: null,
        maxUsers: 5,
        isActive: true,
        isAssignable: true
      }
    ])

    console.log(`✅ Created ${roles.length} roles`)

    // Récupérer toutes les permissions
    const permissions = await Permission.all()
    console.log(`Found ${permissions.length} permissions`)

    // Définir les permissions par rôle (version simplifiée)
    const rolePermissions = [
      {
        role: 'sage_femme_junior',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'visites.create_prenatal',
          'visites.read_own',
          'personnel.view_own_profile'
        ]
      },
      {
        role: 'sage_femme',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'visites.create_prenatal',
          'visites.create_postnatal',
          'visites.read_own',
          'visites.prescribe',
          'personnel.view_own_profile'
        ]
      },
      {
        role: 'directeur_medical',
        permissions: [
          'patients.create',
          'patients.read_all',
          'patients.update_all',
          'visites.create_prenatal',
          'visites.create_postnatal',
          'visites.read_department',
          'personnel.view_department',
          'reports.view_department'
        ]
      },
      {
        role: 'super_admin',
        permissions: permissions.map(p => p.name) // Toutes les permissions
      }
    ]

    // Assigner les permissions aux rôles (sans champs JSON problématiques)
    for (const rolePermConfig of rolePermissions) {
      const role = roles.find(r => r.name === rolePermConfig.role)
      if (!role) continue

      const rolePermissionsData = []
      
      for (const permissionName of rolePermConfig.permissions) {
        const permission = permissions.find(p => p.name === permissionName)
        if (permission) {
          rolePermissionsData.push({
            roleId: role.id,
            permissionId: permission.id,
            tenantId: null,
            grantedBy: null,
            grantedAt: DateTime.now(),
            grantReason: 'System role default permissions',
            isActive: true,
            isInherited: false
            // Pas de conditions pour éviter les problèmes JSON
          })
        }
      }

      if (rolePermissionsData.length > 0) {
        await RolePermission.createMany(rolePermissionsData)
        console.log(`✅ Assigned ${rolePermissionsData.length} permissions to role: ${role.displayName}`)
      }
    }

    console.log('✅ Roles and role-permissions seeded successfully')
  }
}