import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import PersonnelCategory from '#models/personnel_category'
import PersonnelSubcategory from '#models/personnel_subcategory'
import TypePersonnel from '#models/type_personnel'
import Permission from '#models/permission'
import Role from '#models/role'
import RolePermission from '#models/role_permission'
import TypeVisite from '#models/type_visite'

export default class extends BaseSeeder {
  async run() {
    console.log('🚀 Starting RBAC system seeding...')
    console.log('='.repeat(50))
    
    try {
      // 1. Personnel Categories & Types
      console.log('\n📋 1. Creating personnel categories, subcategories and types...')
      await this.seedPersonnelCategories()
      console.log('✅ Personnel structure seeded successfully')
      
      // 2. Permissions
      console.log('\n📋 2. Creating permissions...')  
      await this.seedPermissions()
      console.log('✅ Permissions seeded successfully')
      
      // 3. Roles & Role Permissions
      console.log('\n📋 3. Creating roles and assigning permissions...')
      await this.seedRoles()
      console.log('✅ Roles and permissions seeded successfully')
      
      // 4. Visit Types
      console.log('\n📋 4. Creating visit types...')
      await this.seedTypeVisites()
      console.log('✅ Visit types seeded successfully')
      
    } catch (error) {
      console.error('❌ Seeding failed:', error.message)
      throw error
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 RBAC system seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   ✅ Personnel categories, subcategories & types')
    console.log('   ✅ Permissions (medical & administrative)')
    console.log('   ✅ Roles with assigned permissions')  
    console.log('   ✅ Visit types for medical consultations')
    console.log('\n🔐 Your multi-tenant RBAC system is ready!')
    console.log('\n📚 Next steps:')
    console.log('   1. Create personnel records linked to users')
    console.log('   2. Assign roles to users in specific tenants') 
    console.log('   3. Test permissions in your controllers')
    console.log('   4. Implement authorization middleware')
  }

  // Personnel Categories Seeding
  async seedPersonnelCategories() {
    // Créer les catégories principales
    const categories = await PersonnelCategory.createMany([
      {
        name: 'medical',
        nomCategory: 'Médical',
        description: 'Personnel médical qualifié',
        colorCode: '#2E7D32',
        icon: 'fa-user-md',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'paramedical',
        nomCategory: 'Paramédical',
        description: 'Personnel paramédical et soignant',
        colorCode: '#1976D2',
        icon: 'fa-user-nurse',
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'administratif',
        nomCategory: 'Administratif',
        description: 'Personnel administratif et de gestion',
        colorCode: '#FFC107',
        icon: 'fa-user-tie',
        sortOrder: 3,
        isActive: true
      },
      {
        name: 'technique',
        nomCategory: 'Technique',
        description: 'Personnel technique et de maintenance',
        colorCode: '#9C27B0',
        icon: 'fa-user-cog',
        sortOrder: 4,
        isActive: true
      }
    ])

    // Créer les sous-catégories
    const subcategories = await PersonnelSubcategory.createMany([
      // Sous-catégories médicales
      {
        categoryId: categories[0].id, // medical
        name: 'obstetrique',
        nomSubcategory: 'Obstétrique',
        description: 'Spécialité obstétrique et gynécologie',
        requiresSpecialization: true,
        sortOrder: 1,
        isActive: true
      },
      {
        categoryId: categories[0].id, // medical
        name: 'pediatrie',
        nomSubcategory: 'Pédiatrie',
        description: 'Spécialité pédiatrique',
        requiresSpecialization: true,
        sortOrder: 2,
        isActive: true
      },
      {
        categoryId: categories[0].id, // medical
        name: 'medecine_generale',
        nomSubcategory: 'Médecine Générale',
        description: 'Médecine générale',
        requiresSpecialization: false,
        sortOrder: 3,
        isActive: true
      },
      // Sous-catégories paramédicales
      {
        categoryId: categories[1].id, // paramedical
        name: 'soins_generaux',
        nomSubcategory: 'Soins Généraux',
        description: 'Soins infirmiers généraux',
        requiresSpecialization: false,
        sortOrder: 1,
        isActive: true
      },
      // Sous-catégories administratives
      {
        categoryId: categories[2].id, // administratif
        name: 'direction',
        nomSubcategory: 'Direction',
        description: 'Direction et management',
        requiresSpecialization: false,
        sortOrder: 1,
        isActive: true
      },
      {
        categoryId: categories[2].id, // administratif
        name: 'gestion',
        nomSubcategory: 'Gestion',
        description: 'Gestion administrative',
        requiresSpecialization: false,
        sortOrder: 2,
        isActive: true
      },
      {
        categoryId: categories[2].id, // administratif
        name: 'accueil',
        nomSubcategory: 'Accueil',
        description: 'Accueil et orientation',
        requiresSpecialization: false,
        sortOrder: 3,
        isActive: true
      }
    ])

    // Créer les types de personnel détaillés
    const typePersonnels = await TypePersonnel.createMany([
      // MEDICAL - Obstétrique
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[0].id, // obstetrique
        name: 'sage_femme_junior',
        nomType: 'Sage-femme Junior',
        description: 'Sage-femme débutante en formation',
        level: 1,
        canPrescribe: true,
        canSupervise: false,
        canValidateActs: false,
        requiresLicense: true,
        minExperienceYears: 0,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 1,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[0].id, // obstetrique
        name: 'sage_femme',
        nomType: 'Sage-femme',
        description: 'Sage-femme expérimentée',
        level: 2,
        canPrescribe: true,
        canSupervise: false,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 2,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 2,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[0].id, // obstetrique
        name: 'sage_femme_senior',
        nomType: 'Sage-femme Senior',
        description: 'Sage-femme senior avec responsabilités',
        level: 3,
        canPrescribe: true,
        canSupervise: true,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 5,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 3,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[0].id, // obstetrique
        name: 'gyneco_obstetricien',
        nomType: 'Gynéco-obstétricien',
        description: 'Médecin spécialiste en gynéco-obstétrique',
        level: 4,
        canPrescribe: true,
        canSupervise: true,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 8,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 4,
        isActive: true
      },
      // MEDICAL - Pédiatrie
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[1].id, // pediatrie
        name: 'pediatre',
        nomType: 'Pédiatre',
        description: 'Médecin pédiatre',
        level: 3,
        canPrescribe: true,
        canSupervise: true,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 6,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 1,
        isActive: true
      },
      // MEDICAL - Médecine générale
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[2].id, // medecine_generale
        name: 'medecin_generaliste',
        nomType: 'Médecin Généraliste',
        description: 'Médecin généraliste',
        level: 2,
        canPrescribe: true,
        canSupervise: false,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 3,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 1,
        isActive: true
      },
      // PARAMEDICAL - Soins généraux
      {
        categoryId: categories[1].id,
        subcategoryId: subcategories[3].id, // soins_generaux
        name: 'infirmier',
        nomType: 'Infirmier/ère',
        description: 'Personnel infirmier diplômé',
        level: 2,
        canPrescribe: false,
        canSupervise: false,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 0,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 1,
        isActive: true
      },
      {
        categoryId: categories[1].id,
        subcategoryId: subcategories[3].id, // soins_generaux
        name: 'infirmier_senior',
        nomType: 'Infirmier/ère Senior',
        description: 'Infirmier expérimenté avec responsabilités',
        level: 3,
        canPrescribe: false,
        canSupervise: true,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 5,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 2,
        isActive: true
      },
      // ADMINISTRATIF - Direction
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[4].id, // direction
        name: 'directeur_medical',
        nomType: 'Directeur Médical',
        description: 'Directeur des affaires médicales',
        level: 4,
        canPrescribe: false,
        canSupervise: true,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 15,
        isMedicalStaff: true,
        isAdministrative: true,
        isTechnical: false,
        sortOrder: 1,
        isActive: true
      },
      // ADMINISTRATIF - Gestion
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[5].id, // gestion
        name: 'secretaire_medicale',
        nomType: 'Secrétaire Médicale',
        description: 'Secrétaire spécialisée médicale',
        level: 1,
        canPrescribe: false,
        canSupervise: false,
        canValidateActs: false,
        requiresLicense: false,
        minExperienceYears: 0,
        isMedicalStaff: false,
        isAdministrative: true,
        isTechnical: false,
        sortOrder: 1,
        isActive: true
      },
      // ADMINISTRATIF - Accueil
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[6].id, // accueil
        name: 'receptionniste',
        nomType: 'Réceptionniste',
        description: 'Personnel d\'accueil et orientation',
        level: 1,
        canPrescribe: false,
        canSupervise: false,
        canValidateActs: false,
        requiresLicense: false,
        minExperienceYears: 0,
        isMedicalStaff: false,
        isAdministrative: true,
        isTechnical: false,
        sortOrder: 1,
        isActive: true
      }
    ])

    console.log(`📊 Created: ${categories.length} categories, ${subcategories.length} subcategories, ${typePersonnels.length} personnel types`)
  }

  // Permissions Seeding
  async seedPermissions() {
    const permissions = await Permission.createMany([
      // PATIENTS
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
      
      // VISITES
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
      
      // PERSONNEL
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
      
      // REPORTS
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
      
      // SYSTEM
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
      }
    ])

    console.log(`📊 Created: ${permissions.length} permissions`)
  }

  // Roles Seeding
  async seedRoles() {
    // Récupérer les types de personnel
    const typePersonnels = await TypePersonnel.query()
      .preload('category')
      .preload('subcategory')

    // Créer les rôles système de base
    const roles = await Role.createMany([
      {
        tenantId: null,
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
        name: 'directeur_medical',
        displayName: 'Directeur Médical',
        description: 'Rôle pour directeur médical avec responsabilités administratives et médicales',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: true,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'directeur_medical')?.id,
        maxUsers: 1,
        isActive: true,
        isAssignable: true
      }
    ])

    // Récupérer toutes les permissions
    const permissions = await Permission.all()

    // Définir les permissions par rôle (simplifié)
    const rolePermissions = [
      {
        role: 'sage_femme_junior',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'visites.create_prenatal',
          'visites.read_own',
          'visites.update_own',
          'visites.prescribe',
          'personnel.view_own_profile',
          'reports.view_own'
        ]
      },
      {
        role: 'sage_femme',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'patients.assign_doctor',
          'visites.create_prenatal',
          'visites.read_own',
          'visites.update_own',
          'visites.prescribe',
          'personnel.view_own_profile',
          'reports.view_own'
        ]
      },
      {
        role: 'directeur_medical',
        permissions: permissions.map(p => p.name) // Toutes les permissions
      }
    ]

    // Assigner les permissions aux rôles
    for (const rolePermConfig of rolePermissions) {
      const role = roles.find(r => r.name === rolePermConfig.role)
      if (!role) continue

      const rolePermissionRecords = []
      
      for (const permissionName of rolePermConfig.permissions) {
        const permission = permissions.find(p => p.name === permissionName)
        if (permission) {
          rolePermissionRecords.push({
            roleId: role.id,
            permissionId: permission.id,
            tenantId: null,
            grantedBy: null,
            grantedAt: DateTime.now(),
            grantReason: 'System role default permissions',
            isActive: true,
            isInherited: false
          })
        }
      }

      if (rolePermissionRecords.length > 0) {
        await RolePermission.createMany(rolePermissionRecords)
        console.log(`✅ Assigned ${rolePermissionRecords.length} permissions to role: ${role.displayName}`)
      }
    }

    console.log(`📊 Created: ${roles.length} roles`)
  }

  // Visit Types Seeding  
  async seedTypeVisites() {
    const typePersonnels = await TypePersonnel.all()
    const sageFemmeTypes = typePersonnels.filter(tp => tp.name.includes('sage_femme')).map(tp => tp.id)
    const allMedicalTypes = typePersonnels.filter(tp => tp.isMedicalStaff).map(tp => tp.id)

    const typeVisites = await TypeVisite.createMany([
      {
        name: 'consultation_prenatal_1t',
        nomType: 'Consultation prénatale 1er trimestre',
        description: 'Première consultation de grossesse (6-13 semaines)',
        durationMinutes: 45,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: true,
        requiresNurse: false,
        allowedPersonnelTypes: sageFemmeTypes,
        isPrenatal: true,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: 6,
        maxPregnancyWeek: 13,
        colorCode: '#4CAF50',
        icon: 'fa-baby',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'visite_postnatal_j3',
        nomType: 'Visite postnatale J+3',
        description: 'Première visite postnatale à 3 jours',
        durationMinutes: 45,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: true,
        requiresNurse: false,
        allowedPersonnelTypes: sageFemmeTypes,
        isPrenatal: false,
        isPostnatal: true,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#2196F3',
        icon: 'fa-heart',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'urgence_obstetricale',
        nomType: 'Urgence obstétricale',
        description: 'Urgence liée à la grossesse ou accouchement',
        durationMinutes: 60,
        requiresAppointment: false,
        isEmergency: true,
        requiresDoctor: true,
        requiresMidwife: true,
        requiresNurse: true,
        allowedPersonnelTypes: allMedicalTypes,
        isPrenatal: true,
        isPostnatal: true,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#F44336',
        icon: 'fa-ambulance',
        sortOrder: 1,
        isActive: true
      }
    ])

    console.log(`📊 Created: ${typeVisites.length} visit types`)
  }
}