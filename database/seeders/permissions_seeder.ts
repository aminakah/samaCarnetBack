import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Permission from '#models/permission'

export default class extends BaseSeeder {
  async run() {
    const permissions = await Permission.createMany([
      // PATIENTS - Permissions de base
      {
        name: 'patients.create',
        displayName: 'Créer un patient',
        description: 'Peut créer de nouveaux patients',
        module: 'patients',
        action: 'create',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: false,
        requiresAudit: true,
        isActive: true
      },
      {
        name: 'patients.read_own',
        displayName: 'Voir ses patients',
        description: 'Peut voir les patients qui lui sont assignés',
        module: 'patients',
        action: 'read',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: false,
        isActive: true
      },
      {
        name: 'patients.read_all',
        displayName: 'Voir tous les patients',
        description: 'Peut voir tous les patients du tenant',
        module: 'patients',
        action: 'read',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 2,
        isActive: true
      },
      {
        name: 'patients.update_own',
        displayName: 'Modifier ses patients',
        description: 'Peut modifier les patients qui lui sont assignés',
        module: 'patients',
        action: 'update',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: true,
        isActive: true
      },
      {
        name: 'patients.update_all',
        displayName: 'Modifier tous patients',
        description: 'Peut modifier tous les patients du tenant',
        module: 'patients',
        action: 'update',
        scope: 'tenant',
        requiresSupervision: true,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 3,
        isActive: true
      },
      {
        name: 'patients.delete',
        displayName: 'Supprimer patient',
        description: 'Peut supprimer des patients (soft delete)',
        module: 'patients',
        action: 'delete',
        scope: 'tenant',
        requiresSupervision: true,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 4,
        isActive: true
      },
      {
        name: 'patients.assign_doctor',
        displayName: 'Assigner médecin',
        description: 'Peut assigner un médecin à un patient',
        module: 'patients',
        action: 'assign',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: true,
        minLevelRequired: 2,
        isActive: true
      },

      // VISITES - Consultations et visites
      {
        name: 'visites.create_prenatal',
        displayName: 'Créer visite prénatale',
        description: 'Peut créer des visites prénatales',
        module: 'visites',
        action: 'create',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: false,
        minLevelRequired: 1,
        isActive: true
      },
      {
        name: 'visites.create_postnatal',
        displayName: 'Créer visite postnatale',
        description: 'Peut créer des visites postnatales',
        module: 'visites',
        action: 'create',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: false,
        minLevelRequired: 1,
        isActive: true
      },
      {
        name: 'visites.create_emergency',
        displayName: 'Créer visite urgence',
        description: 'Peut créer des visites d\'urgence',
        module: 'visites',
        action: 'create',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: true,
        minLevelRequired: 2,
        isActive: true
      },
      {
        name: 'visites.read_own',
        displayName: 'Voir ses visites',
        description: 'Peut voir ses propres visites',
        module: 'visites',
        action: 'read',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: false,
        isActive: true
      },
      {
        name: 'visites.read_department',
        displayName: 'Voir visites du service',
        description: 'Peut voir les visites de son service',
        module: 'visites',
        action: 'read',
        scope: 'department',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: true,
        requiresAudit: false,
        minLevelRequired: 3,
        isActive: true
      },
      {
        name: 'visites.update_own',
        displayName: 'Modifier ses visites',
        description: 'Peut modifier ses propres visites',
        module: 'visites',
        action: 'update',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: true,
        isActive: true
      },
      {
        name: 'visites.delete_own',
        displayName: 'Supprimer ses visites',
        description: 'Peut supprimer ses propres visites',
        module: 'visites',
        action: 'delete',
        scope: 'own',
        requiresSupervision: true,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 2,
        isActive: true
      },

      // PRESCRIPTIONS - Permissions médicales avancées
      {
        name: 'visites.prescribe',
        displayName: 'Prescrire médicaments',
        description: 'Peut prescrire des médicaments',
        module: 'visites',
        action: 'prescribe',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 1,
        conditions: { can_prescribe: true },
        isActive: true
      },
      {
        name: 'visites.prescribe_controlled',
        displayName: 'Prescrire substances contrôlées',
        description: 'Peut prescrire des substances contrôlées',
        module: 'visites',
        action: 'prescribe',
        scope: 'own',
        requiresSupervision: true,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 2,
        conditions: { can_prescribe: true },
        isActive: true
      },
      {
        name: 'visites.validate_diagnosis',
        displayName: 'Valider diagnostic',
        description: 'Peut valider un diagnostic médical',
        module: 'visites',
        action: 'validate',
        scope: 'department',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 3,
        conditions: { can_validate_acts: true },
        isActive: true
      },

      // VACCINATIONS
      {
        name: 'vaccinations.create',
        displayName: 'Créer vaccination',
        description: 'Peut créer des enregistrements de vaccination',
        module: 'vaccinations',
        action: 'create',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: true,
        minLevelRequired: 1,
        isActive: true
      },
      {
        name: 'vaccinations.administer',
        displayName: 'Administrer vaccin',
        description: 'Peut administrer des vaccins',
        module: 'vaccinations',
        action: 'administer',
        scope: 'own',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 1,
        isActive: true
      },
      {
        name: 'vaccinations.schedule',
        displayName: 'Programmer vaccination',
        description: 'Peut programmer des vaccinations',
        module: 'vaccinations',
        action: 'schedule',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: false,
        requiresAudit: false,
        minLevelRequired: 1,
        isActive: true
      },

      // PERSONNEL - Gestion du personnel
      {
        name: 'personnel.view_own_profile',
        displayName: 'Voir son profil',
        description: 'Peut voir son propre profil personnel',
        module: 'personnel',
        action: 'read',
        scope: 'own',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: false,
        requiresAudit: false,
        isActive: true
      },
      {
        name: 'personnel.view_department',
        displayName: 'Voir personnel du service',
        description: 'Peut voir le personnel de son service',
        module: 'personnel',
        action: 'read',
        scope: 'department',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: false,
        requiresAudit: false,
        minLevelRequired: 2,
        isActive: true
      },
      {
        name: 'personnel.manage_schedules',
        displayName: 'Gérer les plannings',
        description: 'Peut gérer les plannings du personnel',
        module: 'personnel',
        action: 'manage',
        scope: 'department',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: false,
        requiresAudit: true,
        minLevelRequired: 3,
        conditions: { can_supervise: true },
        isActive: true
      },
      {
        name: 'personnel.assign_roles',
        displayName: 'Assigner rôles',
        description: 'Peut assigner des rôles au personnel',
        module: 'personnel',
        action: 'assign',
        scope: 'tenant',
        requiresSupervision: true,
        isMedical: false,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 4,
        isActive: true
      },

      // REPORTS - Rapports et statistiques
      {
        name: 'reports.view_own',
        displayName: 'Voir ses rapports',
        description: 'Peut voir ses propres rapports d\'activité',
        module: 'reports',
        action: 'read',
        scope: 'own',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: false,
        requiresAudit: false,
        isActive: true
      },
      {
        name: 'reports.view_department',
        displayName: 'Voir rapports du service',
        description: 'Peut voir les rapports de son service',
        module: 'reports',
        action: 'read',
        scope: 'department',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 3,
        isActive: true
      },
      {
        name: 'reports.export_anonymous',
        displayName: 'Exporter données anonymes',
        description: 'Peut exporter des données anonymisées',
        module: 'reports',
        action: 'export',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: false,
        requiresAudit: true,
        minLevelRequired: 2,
        isActive: true
      },
      {
        name: 'reports.export_identified',
        displayName: 'Exporter données nominatives',
        description: 'Peut exporter des données nominatives',
        module: 'reports',
        action: 'export',
        scope: 'tenant',
        requiresSupervision: true,
        isMedical: false,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 4,
        isActive: true
      },

      // EMERGENCY - Permissions d'urgence
      {
        name: 'emergency.access',
        displayName: 'Accès mode urgence',
        description: 'Peut accéder au mode urgence',
        module: 'emergency',
        action: 'access',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 1,
        isActive: true
      },
      {
        name: 'emergency.override_restrictions',
        displayName: 'Contourner restrictions urgence',
        description: 'Peut contourner les restrictions en cas d\'urgence',
        module: 'emergency',
        action: 'override',
        scope: 'tenant',
        requiresSupervision: true,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 2,
        isActive: true
      },

      // SYSTEM - Administration système
      {
        name: 'system.manage_tenant',
        displayName: 'Gérer le tenant',
        description: 'Peut gérer la configuration du tenant',
        module: 'system',
        action: 'manage',
        scope: 'tenant',
        requiresSupervision: true,
        isMedical: false,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 4,
        isActive: true
      },
      {
        name: 'system.manage_roles',
        displayName: 'Gérer les rôles',
        description: 'Peut gérer les rôles et permissions',
        module: 'system',
        action: 'manage',
        scope: 'tenant',
        requiresSupervision: true,
        isMedical: false,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 4,
        isActive: true
      },
      {
        name: 'system.audit_logs',
        displayName: 'Consulter logs d\'audit',
        description: 'Peut consulter les logs d\'audit',
        module: 'system',
        action: 'read',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 4,
        isActive: true
      }
    ])

    console.log('✅ Permissions seeded successfully')
    console.log(`📊 Created: ${permissions.length} permissions`)
    
    // Afficher un résumé par module
    const summary = permissions.reduce((acc, perm) => {
      acc[perm.module] = (acc[perm.module] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('📈 Permissions par module:')
    Object.entries(summary).forEach(([module, count]) => {
      console.log(`   - ${module}: ${count} permissions`)
    })
  }
}