import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import Permission from '#models/permission'
import RolePermission from '#models/role_permission'

export default class RolesPermissionsSeeder extends BaseSeeder {
  async run() {
    console.log('  🔐 Seeding roles and permissions...')

    // Create basic permissions
    const permissions = [
      // Patient permissions
      { name: 'patient.read', displayName: 'Voir profil patient', module: 'patient', action: 'read', isMedical: true },
      { name: 'patient.update', displayName: 'Modifier profil patient', module: 'patient', action: 'update', isMedical: true },
      
      // Pregnancy permissions
      { name: 'pregnancy.read', displayName: 'Voir grossesses', module: 'pregnancy', action: 'read', isMedical: true },
      { name: 'pregnancy.create', displayName: 'Créer grossesse', module: 'pregnancy', action: 'create', isMedical: true },
      { name: 'pregnancy.update', displayName: 'Modifier grossesse', module: 'pregnancy', action: 'update', isMedical: true },
      
      // Consultation permissions
      { name: 'consultation.read', displayName: 'Voir consultations', module: 'consultation', action: 'read', isMedical: true },
      { name: 'consultation.create', displayName: 'Créer consultation', module: 'consultation', action: 'create', isMedical: true },
      { name: 'consultation.update', displayName: 'Modifier consultation', module: 'consultation', action: 'update', isMedical: true },
      
      // Vaccination permissions
      { name: 'vaccination.read', displayName: 'Voir vaccinations', module: 'vaccination', action: 'read', isMedical: true },
      { name: 'vaccination.create', displayName: 'Enregistrer vaccination', module: 'vaccination', action: 'create', isMedical: true },
      { name: 'vaccination.update', displayName: 'Modifier vaccination', module: 'vaccination', action: 'update', isMedical: true },
      
      // Admin permissions
      { name: 'admin.all', displayName: 'Administration complète', module: 'admin', action: 'all', scope: 'tenant' },
      { name: 'user.manage', displayName: 'Gérer utilisateurs', module: 'user', action: 'manage', scope: 'tenant' },
    ]

    const createdPermissions = []
    for (const permData of permissions) {
      const permission = await Permission.create({
        ...permData,
        scope: permData.scope || 'own',
        requiresSupervision: false,
        isMedical: permData.isMedical || false,
        isSensitive: false,
        requiresAudit: false,
        isSystem: true,
        isActive: true
      })
      createdPermissions.push(permission)
    }

    // Create basic roles
    const roles = [
      {
        name: 'admin',
        displayName: 'Administrateur',
        description: 'Administrateur du système',
        level: 100,
        isSystem: true,
        isMedical: false,
        isAdministrative: true,
        isActive: true,
        isAssignable: true,
        permissions: ['admin.all', 'user.manage', 'patient.read', 'patient.update', 'pregnancy.read', 'pregnancy.create', 'pregnancy.update', 'consultation.read', 'consultation.create', 'consultation.update', 'vaccination.read', 'vaccination.create', 'vaccination.update']
      },
      {
        name: 'doctor',
        displayName: 'Médecin',
        description: 'Médecin praticien',
        level: 80,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        isActive: true,
        isAssignable: true,
        permissions: ['patient.read', 'patient.update', 'pregnancy.read', 'pregnancy.create', 'pregnancy.update', 'consultation.read', 'consultation.create', 'consultation.update', 'vaccination.read', 'vaccination.create', 'vaccination.update']
      },
      {
        name: 'midwife',
        displayName: 'Sage-femme',
        description: 'Sage-femme certifiée',
        level: 70,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        isActive: true,
        isAssignable: true,
        permissions: ['patient.read', 'patient.update', 'pregnancy.read', 'pregnancy.create', 'pregnancy.update', 'consultation.read', 'consultation.create', 'consultation.update', 'vaccination.read', 'vaccination.create', 'vaccination.update']
      },
      {
        name: 'patient',
        displayName: 'Patient',
        description: 'Patient du système',
        level: 10,
        isSystem: true,
        isMedical: false,
        isAdministrative: false,
        isActive: true,
        isAssignable: true,
        permissions: ['patient.read']
      }
    ]

    for (const roleData of roles) {
      const { permissions: rolePermissions, ...roleInfo } = roleData
      
      const role = await Role.create({
        ...roleInfo,
        tenantId: null // System roles
      })

      // Assign permissions to role
      for (const permissionName of rolePermissions) {
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

    console.log('  ✅ Roles and permissions seeded successfully')
  }
}