import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import Permission from '#models/permission'
import RolePermission from '#models/role_permission'

export default class RbacStructureSeeder extends BaseSeeder {
  async run() {
    console.log('  🔐 Setting up RBAC structure for prenatal care app...')

    // 1. PERMISSIONS PAR MODULE
    const permissions = [
      // === PATIENT MODULE ===
      { name: 'patient.view_own', module: 'patient', action: 'view', scope: 'own' },
      { name: 'patient.view_all', module: 'patient', action: 'view', scope: 'tenant' },
      { name: 'patient.create', module: 'patient', action: 'create', scope: 'tenant' },
      { name: 'patient.update_own', module: 'patient', action: 'update', scope: 'own' },
      { name: 'patient.update_all', module: 'patient', action: 'update', scope: 'tenant' },
      { name: 'patient.qr_scan', module: 'patient', action: 'qr_scan', scope: 'global' },

      // === PREGNANCY MODULE ===
      { name: 'pregnancy.view_own', module: 'pregnancy', action: 'view', scope: 'own' },
      { name: 'pregnancy.view_assigned', module: 'pregnancy', action: 'view', scope: 'assigned' },
      { name: 'pregnancy.create', module: 'pregnancy', action: 'create', scope: 'tenant', isMedical: true },
      { name: 'pregnancy.update', module: 'pregnancy', action: 'update', scope: 'tenant', isMedical: true },
      { name: 'pregnancy.close', module: 'pregnancy', action: 'close', scope: 'tenant', isMedical: true },

      // === CONSULTATION MODULE ===
      { name: 'consultation.view_own', module: 'consultation', action: 'view', scope: 'own' },
      { name: 'consultation.view_assigned', module: 'consultation', action: 'view', scope: 'assigned' },
      { name: 'consultation.create', module: 'consultation', action: 'create', scope: 'tenant', isMedical: true },
      { name: 'consultation.update_own', module: 'consultation', action: 'update', scope: 'own', isMedical: true },
      { name: 'consultation.validate', module: 'consultation', action: 'validate', scope: 'tenant', isMedical: true },

      // === PRESCRIPTION MODULE ===
      { name: 'prescription.view_own', module: 'prescription', action: 'view', scope: 'own' },
      { name: 'prescription.create', module: 'prescription', action: 'create', scope: 'tenant', isMedical: true },
      { name: 'prescription.update_own', module: 'prescription', action: 'update', scope: 'own', isMedical: true },

      // === VACCINATION MODULE ===
      { name: 'vaccination.view_own', module: 'vaccination', action: 'view', scope: 'own' },
      { name: 'vaccination.view_all', module: 'vaccination', action: 'view', scope: 'tenant' },
      { name: 'vaccination.administer', module: 'vaccination', action: 'administer', scope: 'tenant', isMedical: true },
      { name: 'vaccination.schedule', module: 'vaccination', action: 'schedule', scope: 'tenant', isMedical: true },

      // === APPOINTMENT MODULE ===
      { name: 'appointment.view_own', module: 'appointment', action: 'view', scope: 'own' },
      { name: 'appointment.view_assigned', module: 'appointment', action: 'view', scope: 'assigned' },
      { name: 'appointment.create', module: 'appointment', action: 'create', scope: 'tenant' },
      { name: 'appointment.update', module: 'appointment', action: 'update', scope: 'tenant' },
      { name: 'appointment.cancel', module: 'appointment', action: 'cancel', scope: 'tenant' },

      // === REMINDER MODULE ===
      { name: 'reminder.view_own', module: 'reminder', action: 'view', scope: 'own' },
      { name: 'reminder.create', module: 'reminder', action: 'create', scope: 'tenant' },
      { name: 'reminder.manage', module: 'reminder', action: 'manage', scope: 'tenant' },

      // === PERSONNEL MODULE ===
      { name: 'personnel.view', module: 'personnel', action: 'view', scope: 'tenant' },
      { name: 'personnel.create', module: 'personnel', action: 'create', scope: 'tenant' },
      { name: 'personnel.update', module: 'personnel', action: 'update', scope: 'tenant' },
      { name: 'personnel.deactivate', module: 'personnel', action: 'deactivate', scope: 'tenant' },

      // === REPORTS MODULE ===
      { name: 'reports.view_basic', module: 'reports', action: 'view', scope: 'tenant' },
      { name: 'reports.view_detailed', module: 'reports', action: 'view_detailed', scope: 'tenant' },
      { name: 'reports.export', module: 'reports', action: 'export', scope: 'tenant' },

      // === ADMIN MODULE ===
      { name: 'admin.tenant_settings', module: 'admin', action: 'settings', scope: 'tenant' },
      { name: 'admin.user_management', module: 'admin', action: 'user_mgmt', scope: 'tenant' },
      { name: 'admin.role_management', module: 'admin', action: 'role_mgmt', scope: 'tenant' },
      { name: 'admin.system_config', module: 'admin', action: 'system', scope: 'global' },
    ]

    // Créer les permissions
    const createdPermissions = []
    for (const permData of permissions) {
      const permission = await Permission.create({
        name: permData.name,
        displayName: permData.name.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        module: permData.module,
        action: permData.action,
        scope: permData.scope as any,
        isMedical: permData.isMedical || false,
        isSystem: true,
        isActive: true
      })
      createdPermissions.push(permission)
    }

    // 2. RÔLES ET LEURS PERMISSIONS
    const rolePermissions = {
      // === PATIENT ===
      patient: [
        'patient.view_own', 'patient.update_own',
        'pregnancy.view_own',
        'consultation.view_own',
        'prescription.view_own',
        'vaccination.view_own',
        'appointment.view_own', 'appointment.create',
        'reminder.view_own'
      ],

      // === SAGE-FEMME ===
      midwife: [
        'patient.view_all', 'patient.create', 'patient.update_all', 'patient.qr_scan',
        'pregnancy.view_assigned', 'pregnancy.create', 'pregnancy.update',
        'consultation.view_assigned', 'consultation.create', 'consultation.update_own',
        'prescription.create', 'prescription.update_own',
        'vaccination.view_all', 'vaccination.administer', 'vaccination.schedule',
        'appointment.view_assigned', 'appointment.create', 'appointment.update',
        'reminder.create', 'reminder.manage',
        'reports.view_basic'
      ],

      // === MÉDECIN GÉNÉRALISTE ===
      general_doctor: [
        'patient.view_all', 'patient.create', 'patient.update_all', 'patient.qr_scan',
        'pregnancy.view_assigned', 'pregnancy.create', 'pregnancy.update',
        'consultation.view_assigned', 'consultation.create', 'consultation.update_own', 'consultation.validate',
        'prescription.create', 'prescription.update_own',
        'vaccination.view_all', 'vaccination.administer', 'vaccination.schedule',
        'appointment.view_assigned', 'appointment.create', 'appointment.update',
        'reminder.create', 'reminder.manage',
        'reports.view_basic', 'reports.view_detailed'
      ],

      // === GYNÉCOLOGUE ===
      gynecologist: [
        'patient.view_all', 'patient.create', 'patient.update_all', 'patient.qr_scan',
        'pregnancy.view_assigned', 'pregnancy.create', 'pregnancy.update', 'pregnancy.close',
        'consultation.view_assigned', 'consultation.create', 'consultation.update_own', 'consultation.validate',
        'prescription.create', 'prescription.update_own',
        'vaccination.view_all', 'vaccination.administer', 'vaccination.schedule',
        'appointment.view_assigned', 'appointment.create', 'appointment.update',
        'reminder.create', 'reminder.manage',
        'reports.view_basic', 'reports.view_detailed', 'reports.export'
      ],

      // === INFIRMIÈRE ===
      nurse: [
        'patient.view_all', 'patient.qr_scan',
        'consultation.view_assigned',
        'vaccination.view_all', 'vaccination.administer',
        'appointment.view_assigned', 'appointment.create',
        'reminder.create'
      ],

      // === RÉCEPTIONNISTE ===
      receptionist: [
        'patient.view_all', 'patient.create', 'patient.update_all',
        'appointment.view_assigned', 'appointment.create', 'appointment.update', 'appointment.cancel',
        'reminder.create'
      ],

      // === ADMIN TENANT ===
      tenant_admin: [
        // Toutes les permissions sauf système global
        ...permissions.filter(p => p.scope !== 'global').map(p => p.name),
        'personnel.view', 'personnel.create', 'personnel.update', 'personnel.deactivate',
        'admin.tenant_settings', 'admin.user_management', 'admin.role_management'
      ],

      // === SUPER ADMIN ===
      super_admin: [
        // Toutes les permissions
        ...permissions.map(p => p.name),
        'admin.system_config'
      ]
    }

    // Créer les rôles et assigner les permissions
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const roleData = {
        patient: { displayName: 'Patiente', level: 10, isMedical: false },
        midwife: { displayName: 'Sage-femme', level: 70, isMedical: true },
        general_doctor: { displayName: 'Médecin Généraliste', level: 75, isMedical: true },
        gynecologist: { displayName: 'Gynécologue', level: 80, isMedical: true },
        nurse: { displayName: 'Infirmière', level: 60, isMedical: true },
        receptionist: { displayName: 'Réceptionniste', level: 40, isMedical: false },
        tenant_admin: { displayName: 'Administrateur', level: 90, isMedical: false },
        super_admin: { displayName: 'Super Administrateur', level: 100, isMedical: false }
      }[roleName]

      const role = await Role.create({
        name: roleName,
        displayName: roleData?.displayName || roleName,
        level: roleData?.level || 50,
        isMedical: roleData?.isMedical || false,
        isSystem: true,
        isActive: true,
        isAssignable: true,
        tenantId: null // Rôles système
      })

      // Assigner les permissions au rôle
      for (const permissionName of permissionNames) {
        const permission = createdPermissions.find(p => p.name === permissionName)
        if (permission) {
          await RolePermission.create({
            roleId: role.id,
            permissionId: permission.id,
            tenantId: null,
            isActive: true
          })
        }
      }
    }

    console.log('✅ RBAC structure created successfully')
    console.log(`   - ${createdPermissions.length} permissions`)
    console.log(`   - ${Object.keys(rolePermissions).length} roles`)
  }
}