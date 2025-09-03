import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Role from '#models/role'
import Permission from '#models/permission'
import RolePermission from '#models/role_permission'
import TypePersonnel from '#models/type_personnel'

export default class extends BaseSeeder {
  async run() {
    // Récupérer les types de personnel
    const typePersonnels = await TypePersonnel.query()
      .preload('category')
      .preload('subcategory')

    // Créer les rôles système de base
    const roles = await Role.createMany([
      // RÔLES MÉDICAUX
      {
        tenantId: null, // Rôle système global
        name: 'sage_femme_junior',
        displayName: 'Sage-femme Junior',
        description: 'Rôle pour sage-femme débutante',
        level: 1,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'sage_femme_junior')?.id,
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
        typePersonnelId: typePersonnels.find(tp => tp.name === 'sage_femme')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'sage_femme_senior',
        displayName: 'Sage-femme Senior',
        description: 'Rôle pour sage-femme senior avec responsabilités de supervision',
        level: 3,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'sage_femme_senior')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'gyneco_obstetricien',
        displayName: 'Gynéco-obstétricien',
        description: 'Rôle pour médecin spécialiste en gynéco-obstétrique',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'gyneco_obstetricien')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'medecin_generaliste',
        displayName: 'Médecin Généraliste',
        description: 'Rôle pour médecin généraliste',
        level: 2,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'medecin_generaliste')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'pediatre',
        displayName: 'Pédiatre',
        description: 'Rôle pour médecin pédiatre',
        level: 3,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'pediatre')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },

      // RÔLES PARAMÉDICAUX
      {
        tenantId: null,
        name: 'infirmier',
        displayName: 'Infirmier/ère',
        description: 'Rôle pour personnel infirmier',
        level: 2,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'infirmier')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'infirmier_senior',
        displayName: 'Infirmier/ère Senior',
        description: 'Rôle pour infirmier senior avec responsabilités',
        level: 3,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'infirmier_senior')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },

      // RÔLES ADMINISTRATIFS
      {
        tenantId: null,
        name: 'directeur_medical',
        displayName: 'Directeur Médical',
        description: 'Rôle pour directeur médical avec responsabilités administratives et médicales',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: true,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'directeur_medical')?.id,
        maxUsers: 1, // Un seul directeur médical par tenant
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'secretaire_medicale',
        displayName: 'Secrétaire Médicale',
        description: 'Rôle pour secrétaire médicale',
        level: 1,
        isSystem: true,
        isMedical: false,
        isAdministrative: true,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'secretaire_medicale')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'receptionniste',
        displayName: 'Réceptionniste',
        description: 'Rôle pour personnel d\'accueil',
        level: 1,
        isSystem: true,
        isMedical: false,
        isAdministrative: true,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'receptionniste')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },

      // RÔLE SUPER ADMIN
      {
        tenantId: null,
        name: 'super_admin',
        displayName: 'Super Administrateur',
        description: 'Rôle super admin avec accès complet au système',
        level: 5,
        isSystem: true,
        isMedical: false,
        isAdministrative: true,
        typePersonnelId: null,
        maxUsers: 5, // Maximum 5 super admins par tenant
        isActive: true,
        isAssignable: true
      }
    ])

    // Récupérer toutes les permissions
    const permissions = await Permission.all()

    // Définir les permissions par rôle
    const rolePermissions = [
      // SAGE-FEMME JUNIOR
      {
        role: 'sage_femme_junior',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'visites.create_prenatal',
          'visites.create_postnatal',
          'visites.read_own',
          'visites.update_own',
          'visites.prescribe',
          'vaccinations.create',
          'vaccinations.administer',
          'vaccinations.schedule',
          'personnel.view_own_profile',
          'reports.view_own',
          'emergency.access'
        ]
      },

      // SAGE-FEMME
      {
        role: 'sage_femme',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'patients.assign_doctor',
          'visites.create_prenatal',
          'visites.create_postnatal',
          'visites.read_own',
          'visites.update_own',
          'visites.prescribe',
          'visites.validate_diagnosis',
          'vaccinations.create',
          'vaccinations.administer',
          'vaccinations.schedule',
          'personnel.view_own_profile',
          'personnel.view_department',
          'reports.view_own',
          'reports.export_anonymous',
          'emergency.access'
        ]
      },

      // SAGE-FEMME SENIOR
      {
        role: 'sage_femme_senior',
        permissions: [
          'patients.read_own',
          'patients.read_all',
          'patients.update_own',
          'patients.update_all',
          'patients.assign_doctor',
          'visites.create_prenatal',
          'visites.create_postnatal',
          'visites.create_emergency',
          'visites.read_own',
          'visites.read_department',
          'visites.update_own',
          'visites.delete_own',
          'visites.prescribe',
          'visites.prescribe_controlled',
          'visites.validate_diagnosis',
          'vaccinations.create',
          'vaccinations.administer',
          'vaccinations.schedule',
          'personnel.view_own_profile',
          'personnel.view_department',
          'personnel.manage_schedules',
          'reports.view_own',
          'reports.view_department',
          'reports.export_anonymous',
          'emergency.access',
          'emergency.override_restrictions'
        ]
      },

      // GYNÉCO-OBSTÉTRICIEN
      {
        role: 'gyneco_obstetricien',
        permissions: [
          'patients.create',
          'patients.read_own',
          'patients.read_all',
          'patients.update_own',
          'patients.update_all',
          'patients.assign_doctor',
          'visites.create_prenatal',
          'visites.create_postnatal',
          'visites.create_emergency',
          'visites.read_own',
          'visites.read_department',
          'visites.update_own',
          'visites.delete_own',
          'visites.prescribe',
          'visites.prescribe_controlled',
          'visites.validate_diagnosis',
          'vaccinations.create',
          'vaccinations.administer',
          'vaccinations.schedule',
          'personnel.view_own_profile',
          'personnel.view_department',
          'personnel.manage_schedules',
          'reports.view_own',
          'reports.view_department',
          'reports.export_anonymous',
          'emergency.access',
          'emergency.override_restrictions'
        ]
      },

      // MÉDECIN GÉNÉRALISTE
      {
        role: 'medecin_generaliste',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'patients.assign_doctor',
          'visites.create_prenatal',
          'visites.create_postnatal',
          'visites.read_own',
          'visites.update_own',
          'visites.prescribe',
          'visites.validate_diagnosis',
          'vaccinations.create',
          'vaccinations.administer',
          'vaccinations.schedule',
          'personnel.view_own_profile',
          'personnel.view_department',
          'reports.view_own',
          'reports.export_anonymous',
          'emergency.access'
        ]
      },

      // PÉDIATRE
      {
        role: 'pediatre',
        permissions: [
          'patients.read_own',
          'patients.read_all',
          'patients.update_own',
          'patients.assign_doctor',
          'visites.create_prenatal',
          'visites.create_postnatal',
          'visites.create_emergency',
          'visites.read_own',
          'visites.read_department',
          'visites.update_own',
          'visites.prescribe',
          'visites.prescribe_controlled',
          'visites.validate_diagnosis',
          'vaccinations.create',
          'vaccinations.administer',
          'vaccinations.schedule',
          'personnel.view_own_profile',
          'personnel.view_department',
          'personnel.manage_schedules',
          'reports.view_own',
          'reports.view_department',
          'reports.export_anonymous',
          'emergency.access',
          'emergency.override_restrictions'
        ]
      },

      // INFIRMIER
      {
        role: 'infirmier',
        permissions: [
          'patients.read_own',
          'visites.read_own',
          'vaccinations.create',
          'vaccinations.administer',
          'personnel.view_own_profile',
          'reports.view_own',
          'emergency.access'
        ]
      },

      // INFIRMIER SENIOR
      {
        role: 'infirmier_senior',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'visites.read_own',
          'visites.read_department',
          'vaccinations.create',
          'vaccinations.administer',
          'vaccinations.schedule',
          'personnel.view_own_profile',
          'personnel.view_department',
          'personnel.manage_schedules',
          'reports.view_own',
          'reports.view_department',
          'emergency.access'
        ]
      },

      // DIRECTEUR MÉDICAL
      {
        role: 'directeur_medical',
        permissions: [
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
          'visites.update_own',
          'visites.delete_own',
          'visites.prescribe',
          'visites.prescribe_controlled',
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
          'reports.export_identified',
          'emergency.access',
          'emergency.override_restrictions',
          'system.manage_tenant',
          'system.audit_logs'
        ]
      },

      // SECRÉTAIRE MÉDICALE
      {
        role: 'secretaire_medicale',
        permissions: [
          'patients.create',
          'patients.read_own',
          'personnel.view_own_profile',
          'reports.view_own'
        ]
      },

      // RÉCEPTIONNISTE
      {
        role: 'receptionniste',
        permissions: [
          'patients.create',
          'patients.read_own',
          'personnel.view_own_profile'
        ]
      },

      // SUPER ADMIN - Toutes les permissions
      {
        role: 'super_admin',
        permissions: permissions.map(p => p.name)
      }
    ]

    // Assigner les permissions aux rôles
    for (const rolePermConfig of rolePermissions) {
      const role = roles.find(r => r.name === rolePermConfig.role)
      if (!role) continue

      const rolePermissions = []
      
      for (const permissionName of rolePermConfig.permissions) {
        const permission = permissions.find(p => p.name === permissionName)
        if (permission) {
          rolePermissions.push({
            roleId: role.id,
            permissionId: permission.id,
            tenantId: null, // Permissions système globales
            grantedBy: null,
            grantedAt: DateTime.now(),
            grantReason: 'System role default permissions',
            isActive: true,
            isInherited: false
          })
        }
      }

      if (rolePermissions.length > 0) {
        await RolePermission.createMany(rolePermissions)
        console.log(`✅ Assigned ${rolePermissions.length} permissions to role: ${role.displayName}`)
      }
    }

    console.log('✅ Roles and role-permissions seeded successfully')
    console.log(`📊 Created: ${roles.length} roles`)
    
    // Afficher un résumé des rôles par type
    const roleSummary = {
      medical: roles.filter(r => r.isMedical && !r.isAdministrative).length,
      administrative: roles.filter(r => r.isAdministrative && !r.isMedical).length,
      mixed: roles.filter(r => r.isMedical && r.isAdministrative).length
    }
    
    console.log('📈 Résumé des rôles:')
    console.log(`   - Médicaux: ${roleSummary.medical}`)
    console.log(`   - Administratifs: ${roleSummary.administrative}`)
    console.log(`   - Mixtes: ${roleSummary.mixed}`)
  }
}