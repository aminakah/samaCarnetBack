import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    console.log('  🔗 Seeding RBAC associations...')
    
    // Récupérer tous les rôles et permissions
    const roles = await db.from('roles').select('*')
    const permissions = await db.from('permissions').select('*')
    
    console.log(`Found ${roles.length} roles, ${permissions.length} permissions`)

    // Définir les permissions par rôle
    const rolePermissionsMap = {
      'sage_femme_junior': [
        'patients.read_own',
        'patients.update_own',
        'visites.create_prenatal',
        'visites.read_own',
        'vaccinations.create',
        'personnel.view_own_profile',
        'emergency.access'
      ],
      'sage_femme': [
        'patients.read_own',
        'patients.update_own',
        'patients.assign_doctor',
        'visites.create_prenatal',
        'visites.create_postnatal',
        'visites.read_own',
        'visites.prescribe',
        'vaccinations.create',
        'vaccinations.administer',
        'personnel.view_own_profile',
        'reports.view_own',
        'emergency.access'
      ],
      'sage_femme_senior': [
        'patients.read_own',
        'patients.read_all',
        'patients.update_own',
        'patients.assign_doctor',
        'visites.create_prenatal',
        'visites.create_postnatal',
        'visites.read_own',
        'visites.read_department',
        'visites.prescribe',
        'visites.validate_diagnosis',
        'vaccinations.create',
        'vaccinations.administer',
        'vaccinations.schedule',
        'personnel.view_own_profile',
        'personnel.view_department',
        'reports.view_own',
        'reports.view_department',
        'emergency.access'
      ],
      'gyneco_obstetricien': [
        'patients.create',
        'patients.read_own',
        'patients.read_all',
        'patients.update_own',
        'patients.assign_doctor',
        'visites.create_prenatal',
        'visites.create_postnatal',
        'visites.create_emergency',
        'visites.read_own',
        'visites.read_department',
        'visites.prescribe',
        'visites.prescribe_controlled',
        'visites.validate_diagnosis',
        'vaccinations.create',
        'vaccinations.administer',
        'personnel.view_own_profile',
        'personnel.view_department',
        'reports.view_own',
        'reports.view_department',
        'emergency.access',
        'emergency.override_restrictions'
      ],
      'medecin_generaliste': [
        'patients.read_own',
        'patients.update_own',
        'visites.create_prenatal',
        'visites.create_postnatal',
        'visites.read_own',
        'visites.prescribe',
        'visites.validate_diagnosis',
        'vaccinations.create',
        'vaccinations.administer',
        'personnel.view_own_profile',
        'reports.view_own',
        'emergency.access'
      ],
      'pediatre': [
        'patients.read_own',
        'patients.read_all',
        'patients.update_own',
        'visites.create_prenatal',
        'visites.create_postnatal',
        'visites.read_own',
        'visites.prescribe',
        'visites.prescribe_controlled',
        'visites.validate_diagnosis',
        'vaccinations.create',
        'vaccinations.administer',
        'vaccinations.schedule',
        'personnel.view_own_profile',
        'personnel.view_department',
        'reports.view_own',
        'emergency.access'
      ],
      'infirmier': [
        'patients.read_own',
        'visites.read_own',
        'vaccinations.create',
        'vaccinations.administer',
        'personnel.view_own_profile',
        'emergency.access'
      ],
      'directeur_medical': [
        'patients.create',
        'patients.read_own',
        'patients.read_all',
        'patients.update_own',
        'patients.update_all',
        'patients.delete',
        'patients.assign_doctor',
        'visites.create_prenatal',
        'visites.create_postnatal',
        'visites.create_emergency',
        'visites.read_own',
        'visites.read_department',
        'visites.prescribe',
        'visites.validate_diagnosis',
        'vaccinations.create',
        'vaccinations.administer',
        'vaccinations.schedule',
        'personnel.view_own_profile',
        'personnel.view_department',
        'personnel.manage_schedules',
        'personnel.assign_roles',
        'reports.view_own',
        'reports.view_department',
        'reports.export_anonymous',
        'emergency.access',
        'emergency.override_restrictions',
        'system.manage_tenant',
        'system.audit_logs'
      ],
      'super_admin': permissions.map(p => p.name) // Toutes les permissions
    }

    // Créer les associations role_permissions
    let totalAssociations = 0
    
    for (const [roleName, permissionNames] of Object.entries(rolePermissionsMap)) {
      const role = roles.find(r => r.name === roleName)
      if (!role) {
        console.log(`⚠️  Role ${roleName} not found`)
        continue
      }

      const associationsToCreate = []
      
      for (const permissionName of permissionNames) {
        const permission = permissions.find(p => p.name === permissionName)
        if (permission) {
          associationsToCreate.push({
            role_id: role.id,
            permission_id: permission.id,
            tenant_id: null,
            granted_by: null,
            granted_at: new Date(),
            grant_reason: 'System role default permissions',
            is_active: true,
            is_inherited: false,
            created_at: new Date(),
            updated_at: new Date()
          })
        } else {
          console.log(`⚠️  Permission ${permissionName} not found`)
        }
      }

      if (associationsToCreate.length > 0) {
        await db.table('role_permissions').insert(associationsToCreate)
        totalAssociations += associationsToCreate.length
        console.log(`✅ Assigned ${associationsToCreate.length} permissions to role: ${role.display_name}`)
      }
    }

    console.log(`✅ Created ${totalAssociations} role-permission associations`)
  }
}