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
    console.log('🚀 Starting Complete RBAC System Seeding...')
    console.log('='.repeat(60))
    
    try {
      // 1. Personnel Categories, Subcategories & Types
      console.log('\n📋 1. Creating personnel structure...')
      await this.seedPersonnelStructure()
      
      // 2. Permissions
      console.log('\n📋 2. Creating permissions...')  
      await this.seedPermissions()
      
      // 3. Roles & Role Permissions
      console.log('\n📋 3. Creating roles and assigning permissions...')
      await this.seedRolesAndPermissions()
      
      // 4. Visit Types
      console.log('\n📋 4. Creating visit types...')
      await this.seedVisitTypes()
      
      // 5. Summary
      await this.showSummary()
      
    } catch (error) {
      console.error('❌ Seeding failed:', error.message)
      throw error
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 COMPLETE RBAC SYSTEM SEEDING SUCCESSFUL!')
    console.log('\n🔐 Your multi-tenant RBAC system is ready to use!')
  }

  private async seedPersonnelStructure() {
    // 1. Créer les catégories principales
    const categories = await PersonnelCategory.createMany([
      {
        name: 'medical',
        nomCategory: 'Personnel Médical',
        description: 'Personnel médical qualifié (médecins, sages-femmes)',
        colorCode: '#2E7D32',
        icon: 'fa-user-md',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'paramedical',
        nomCategory: 'Personnel Paramédical',
        description: 'Personnel paramédical et soignant (infirmiers, aides-soignants)',
        colorCode: '#1976D2',
        icon: 'fa-user-nurse',
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'administratif',
        nomCategory: 'Personnel Administratif',
        description: 'Personnel administratif et de gestion',
        colorCode: '#FFC107',
        icon: 'fa-user-tie',
        sortOrder: 3,
        isActive: true
      },
      {
        name: 'technique',
        nomCategory: 'Personnel Technique',
        description: 'Personnel technique et de maintenance',
        colorCode: '#9C27B0',
        icon: 'fa-user-cog',
        sortOrder: 4,
        isActive: true
      }
    ])

    // 2. Créer les sous-catégories spécialisées
    const subcategories = await PersonnelSubcategory.createMany([
      // Médical - Spécialités
      {
        categoryId: categories[0].id,
        name: 'obstetrique_gynecologie',
        nomSubcategory: 'Obstétrique et Gynécologie',
        description: 'Spécialité médicale dédiée à la grossesse et santé féminine',
        requiresSpecialization: true,
        sortOrder: 1,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        name: 'pediatrie',
        nomSubcategory: 'Pédiatrie',
        description: 'Spécialité médicale dédiée aux enfants',
        requiresSpecialization: true,
        sortOrder: 2,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        name: 'medecine_generale',
        nomSubcategory: 'Médecine Générale',
        description: 'Médecine générale et soins primaires',
        requiresSpecialization: false,
        sortOrder: 3,
        isActive: true
      },

      // Paramédical - Types de soins
      {
        categoryId: categories[1].id,
        name: 'soins_infirmiers',
        nomSubcategory: 'Soins Infirmiers',
        description: 'Soins infirmiers généraux et spécialisés',
        requiresSpecialization: false,
        sortOrder: 1,
        isActive: true
      },
      {
        categoryId: categories[1].id,
        name: 'soins_maternels',
        nomSubcategory: 'Soins Maternels',
        description: 'Soins spécialisés en maternité',
        requiresSpecialization: true,
        sortOrder: 2,
        isActive: true
      },

      // Administratif - Départements
      {
        categoryId: categories[2].id,
        name: 'direction',
        nomSubcategory: 'Direction',
        description: 'Direction et management médical',
        requiresSpecialization: false,
        sortOrder: 1,
        isActive: true
      },
      {
        categoryId: categories[2].id,
        name: 'secretariat_medical',
        nomSubcategory: 'Secrétariat Médical',
        description: 'Secrétariat et assistance médicale',
        requiresSpecialization: false,
        sortOrder: 2,
        isActive: true
      },
      {
        categoryId: categories[2].id,
        name: 'accueil_admission',
        nomSubcategory: 'Accueil et Admission',
        description: 'Accueil des patients et gestion des admissions',
        requiresSpecialization: false,
        sortOrder: 3,
        isActive: true
      }
    ])

    // 3. Créer les types de personnel détaillés
    const typePersonnels = await TypePersonnel.createMany([
      // MÉDICAL - Obstétrique/Gynécologie
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[0].id,
        name: 'sage_femme_junior',
        nomType: 'Sage-femme Junior',
        description: 'Sage-femme nouvellement diplômée en formation',
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
        subcategoryId: subcategories[0].id,
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
        subcategoryId: subcategories[0].id,
        name: 'sage_femme_senior',
        nomType: 'Sage-femme Senior',
        description: 'Sage-femme senior avec responsabilités de supervision',
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
        subcategoryId: subcategories[0].id,
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

      // MÉDICAL - Pédiatrie
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[1].id,
        name: 'pediatre',
        nomType: 'Pédiatre',
        description: 'Médecin spécialiste en pédiatrie',
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
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[1].id,
        name: 'pediatre_senior',
        nomType: 'Pédiatre Senior',
        description: 'Pédiatre chef de service',
        level: 4,
        canPrescribe: true,
        canSupervise: true,
        canValidateActs: true,
        requiresLicense: true,
        minExperienceYears: 10,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 2,
        isActive: true
      },

      // MÉDICAL - Médecine Générale
      {
        categoryId: categories[0].id,
        subcategoryId: subcategories[2].id,
        name: 'medecin_generaliste',
        nomType: 'Médecin Généraliste',
        description: 'Médecin de médecine générale',
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

      // PARAMÉDICAL - Soins Infirmiers
      {
        categoryId: categories[1].id,
        subcategoryId: subcategories[3].id,
        name: 'infirmier',
        nomType: 'Infirmier/ère',
        description: 'Infirmier diplômé d\'État',
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
        subcategoryId: subcategories[3].id,
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

      // PARAMÉDICAL - Soins Maternels
      {
        categoryId: categories[1].id,
        subcategoryId: subcategories[4].id,
        name: 'aide_soignante_maternite',
        nomType: 'Aide-soignante Maternité',
        description: 'Aide-soignante spécialisée en maternité',
        level: 1,
        canPrescribe: false,
        canSupervise: false,
        canValidateActs: false,
        requiresLicense: false,
        minExperienceYears: 0,
        isMedicalStaff: true,
        isAdministrative: false,
        isTechnical: false,
        sortOrder: 1,
        isActive: true
      },

      // ADMINISTRATIF - Direction
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[5].id,
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
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[5].id,
        name: 'directeur_administratif',
        nomType: 'Directeur Administratif',
        description: 'Directeur des services administratifs',
        level: 4,
        canPrescribe: false,
        canSupervise: true,
        canValidateActs: false,
        requiresLicense: false,
        minExperienceYears: 10,
        isMedicalStaff: false,
        isAdministrative: true,
        isTechnical: false,
        sortOrder: 2,
        isActive: true
      },

      // ADMINISTRATIF - Secrétariat
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[6].id,
        name: 'secretaire_medicale',
        nomType: 'Secrétaire Médicale',
        description: 'Secrétaire spécialisée en milieu médical',
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
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[6].id,
        name: 'secretaire_senior',
        nomType: 'Secrétaire Senior',
        description: 'Secrétaire médicale expérimentée',
        level: 2,
        canPrescribe: false,
        canSupervise: true,
        canValidateActs: false,
        requiresLicense: false,
        minExperienceYears: 3,
        isMedicalStaff: false,
        isAdministrative: true,
        isTechnical: false,
        sortOrder: 2,
        isActive: true
      },

      // ADMINISTRATIF - Accueil
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[7].id,
        name: 'receptionniste',
        nomType: 'Réceptionniste',
        description: 'Personnel d\'accueil et d\'admission',
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
      {
        categoryId: categories[2].id,
        subcategoryId: subcategories[7].id,
        name: 'chef_accueil',
        nomType: 'Chef d\'Accueil',
        description: 'Responsable du service d\'accueil',
        level: 2,
        canPrescribe: false,
        canSupervise: true,
        canValidateActs: false,
        requiresLicense: false,
        minExperienceYears: 2,
        isMedicalStaff: false,
        isAdministrative: true,
        isTechnical: false,
        sortOrder: 2,
        isActive: true
      }
    ])

    console.log(`   ✅ Created: ${categories.length} catégories`)
    console.log(`   ✅ Created: ${subcategories.length} sous-catégories`)
    console.log(`   ✅ Created: ${typePersonnels.length} types de personnel`)
  }

  private async seedPermissions() {
    const permissions = await Permission.createMany([
      // PATIENTS - Gestion des patients
      {
        name: 'patients.create',
        displayName: 'Créer un patient',
        description: 'Peut créer de nouveaux dossiers patients',
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
        displayName: 'Consulter ses patients',
        description: 'Peut consulter les patients qui lui sont assignés',
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
        displayName: 'Consulter tous les patients',
        description: 'Peut consulter tous les patients du tenant',
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
        description: 'Peut modifier les dossiers de ses patients',
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
        displayName: 'Modifier tous les patients',
        description: 'Peut modifier tous les dossiers patients',
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
        description: 'Peut supprimer des dossiers patients',
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
        name: 'patients.assign_provider',
        displayName: 'Assigner soignant',
        description: 'Peut assigner un soignant à un patient',
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

      // VISITES - Consultations et visites médicales
      {
        name: 'visites.create_prenatal',
        displayName: 'Créer visite prénatale',
        description: 'Peut créer des consultations prénatales',
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
        description: 'Peut créer des consultations postnatales',
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
        description: 'Peut créer des consultations d\'urgence',
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
        displayName: 'Consulter ses visites',
        description: 'Peut consulter ses propres visites',
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
        displayName: 'Consulter visites du service',
        description: 'Peut consulter les visites de son service',
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

      // PRESCRIPTIONS - Actes médicaux avancés
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
        conditions: JSON.stringify({ can_prescribe: true }),
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
        conditions: JSON.stringify({ can_prescribe: true }),
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
        conditions: JSON.stringify({ can_validate_acts: true }),
        isActive: true
      },

      // VACCINATIONS
      {
        name: 'vaccinations.create',
        displayName: 'Enregistrer vaccination',
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
      {
        name: 'vaccinations.contraindicate',
        displayName: 'Contre-indiquer vaccin',
        description: 'Peut contre-indiquer une vaccination',
        module: 'vaccinations',
        action: 'contraindicate',
        scope: 'own',
        requiresSupervision: true,
        isMedical: true,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 2,
        isActive: true
      },

      // PERSONNEL - Gestion du personnel
      {
        name: 'personnel.view_own_profile',
        displayName: 'Consulter son profil',
        description: 'Peut consulter son propre profil professionnel',
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
        displayName: 'Consulter personnel du service',
        description: 'Peut consulter le personnel de son service',
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
        name: 'personnel.view_all',
        displayName: 'Consulter tout le personnel',
        description: 'Peut consulter tout le personnel du tenant',
        module: 'personnel',
        action: 'read',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 4,
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
        conditions: JSON.stringify({ can_supervise: true }),
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
        displayName: 'Consulter ses rapports',
        description: 'Peut consulter ses propres rapports d\'activité',
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
        displayName: 'Consulter rapports du service',
        description: 'Peut consulter les rapports de son service',
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
        name: 'reports.view_all',
        displayName: 'Consulter tous les rapports',
        description: 'Peut consulter tous les rapports du tenant',
        module: 'reports',
        action: 'read',
        scope: 'tenant',
        requiresSupervision: false,
        isMedical: false,
        isSensitive: true,
        requiresAudit: true,
        minLevelRequired: 4,
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
        description: 'Peut consulter les logs d\'audit système',
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

    console.log(`   ✅ Created: ${permissions.length} permissions`)
    
    // Grouper par module pour affichage
    const moduleGroups = permissions.reduce((acc, perm) => {
      acc[perm.module] = (acc[perm.module] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(moduleGroups).forEach(([module, count]) => {
      console.log(`      - ${module}: ${count} permissions`)
    })
  }

  private async seedRolesAndPermissions() {
    // Récupérer les types de personnel et permissions
    const typePersonnels = await TypePersonnel.query().preload('category').preload('subcategory')
    const permissions = await Permission.all()

    // Créer les rôles système
    const roles = await Role.createMany([
      // RÔLES MÉDICAUX - Obstétrique
      {
        tenantId: null,
        name: 'sage_femme_junior',
        displayName: 'Sage-femme Junior',
        description: 'Rôle pour sage-femme nouvellement diplômée',
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
        description: 'Rôle pour sage-femme expérimentée',
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
        description: 'Rôle pour sage-femme senior avec supervision',
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
        description: 'Rôle pour médecin spécialiste gynéco-obstétrique',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'gyneco_obstetricien')?.id,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },

      // RÔLES MÉDICAUX - Pédiatrie
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
      {
        tenantId: null,
        name: 'pediatre_senior',
        displayName: 'Pédiatre Senior',
        description: 'Rôle pour pédiatre chef de service',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'pediatre_senior')?.id,
        maxUsers: 1,
        isActive: true,
        isAssignable: true
      },

      // RÔLES MÉDICAUX - Médecine générale
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
        description: 'Rôle pour directeur médical',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: true,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'directeur_medical')?.id,
        maxUsers: 1,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'directeur_administratif',
        displayName: 'Directeur Administratif',
        description: 'Rôle pour directeur administratif',
        level: 4,
        isSystem: true,
        isMedical: false,
        isAdministrative: true,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'directeur_administratif')?.id,
        maxUsers: 1,
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

      // RÔLE SUPER ADMINISTRATEUR
      {
        tenantId: null,
        name: 'super_admin',
        displayName: 'Super Administrateur',
        description: 'Rôle administrateur avec accès complet',
        level: 5,
        isSystem: true,
        isMedical: false,
        isAdministrative: true,
        typePersonnelId: null,
        maxUsers: 3,
        isActive: true,
        isAssignable: true
      }
    ])

    // Définir les permissions par rôle
    const rolePermissionMappings = [
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
      {
        role: 'sage_femme',
        permissions: [
          'patients.read_own',
          'patients.update_own',
          'patients.assign_provider',
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
      {
        role: 'sage_femme_senior',
        permissions: [
          'patients.read_own',
          'patients.read_all',
          'patients.update_own',
          'patients.update_all',
          'patients.assign_provider',
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
          'vaccinations.contraindicate',
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
      {
        role: 'gyneco_obstetricien',
        permissions: [
          'patients.create',
          'patients.read_own',
          'patients.read_all',
          'patients.update_own',
          'patients.update_all',
          'patients.assign_provider',
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
          'vaccinations.contraindicate',
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
      {
        role: 'pediatre',
        permissions: [
          'patients.read_own',
          'patients.read_all',
          'patients.update_own',
          'patients.assign_provider',
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
      {
        role: 'directeur_medical',
        permissions: [
          'patients.create',
          'patients.read_own',
          'patients.read_all',
          'patients.update_own',
          'patients.update_all',
          'patients.delete',
          'patients.assign_provider',
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
          'vaccinations.contraindicate',
          'personnel.view_own_profile',
          'personnel.view_department',
          'personnel.view_all',
          'personnel.manage_schedules',
          'personnel.assign_roles',
          'reports.view_own',
          'reports.view_department',
          'reports.view_all',
          'reports.export_anonymous',
          'reports.export_identified',
          'emergency.access',
          'emergency.override_restrictions',
          'system.manage_tenant',
          'system.audit_logs'
        ]
      },
      {
        role: 'secretaire_medicale',
        permissions: [
          'patients.create',
          'patients.read_own',
          'personnel.view_own_profile',
          'reports.view_own'
        ]
      },
      {
        role: 'receptionniste',
        permissions: [
          'patients.create',
          'patients.read_own',
          'personnel.view_own_profile'
        ]
      },
      {
        role: 'super_admin',
        permissions: permissions.map(p => p.name)
      }
    ]

    // Assigner les permissions aux rôles
    for (const mapping of rolePermissionMappings) {
      const role = roles.find(r => r.name === mapping.role)
      if (!role) continue

      const rolePermissionRecords = []
      
      for (const permissionName of mapping.permissions) {
        const permission = permissions.find(p => p.name === permissionName)
        if (permission) {
          rolePermissionRecords.push({
            roleId: role.id,
            permissionId: permission.id,
            tenantId: null,
            grantedBy: null,
            grantedAt: DateTime.now(),
            grantReason: 'System default role permissions',
            isActive: true,
            isInherited: false
          })
        }
      }

      if (rolePermissionRecords.length > 0) {
        await RolePermission.createMany(rolePermissionRecords)
        console.log(`   ✅ Assigned ${rolePermissionRecords.length} permissions to: ${role.displayName}`)
      }
    }

    console.log(`   ✅ Created: ${roles.length} system roles`)
  }

  private async seedVisitTypes() {
    const typePersonnels = await TypePersonnel.all()
    const sageFemmeTypes = typePersonnels.filter(tp => tp.name.includes('sage_femme')).map(tp => tp.id)
    const medecinTypes = typePersonnels.filter(tp => tp.name.includes('medecin') || tp.name.includes('gyneco') || tp.name.includes('pediatre')).map(tp => tp.id)
    const infirmierTypes = typePersonnels.filter(tp => tp.name.includes('infirmier')).map(tp => tp.id)
    const allMedicalTypes = typePersonnels.filter(tp => tp.isMedicalStaff).map(tp => tp.id)

    const visitTypes = await TypeVisite.createMany([
      // CONSULTATIONS PRÉNATALES
      {
        name: 'consultation_prenatal_1t',
        nomType: 'Consultation prénatale 1er trimestre',
        description: 'Première consultation de grossesse (6-13 semaines d\'aménorrhée)',
        durationMinutes: 45,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: true,
        requiresNurse: false,
        allowedPersonnelTypes: [...sageFemmeTypes, ...medecinTypes],
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
        name: 'consultation_prenatal_2t',
        nomType: 'Consultation prénatale 2ème trimestre',
        description: 'Consultation du deuxième trimestre (14-27 SA)',
        durationMinutes: 30,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: true,
        requiresNurse: false,
        allowedPersonnelTypes: [...sageFemmeTypes, ...medecinTypes],
        isPrenatal: true,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: 14,
        maxPregnancyWeek: 27,
        colorCode: '#4CAF50',
        icon: 'fa-baby',
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'consultation_prenatal_3t',
        nomType: 'Consultation prénatale 3ème trimestre',
        description: 'Consultation du troisième trimestre (28-40 SA)',
        durationMinutes: 30,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: true,
        requiresNurse: false,
        allowedPersonnelTypes: [...sageFemmeTypes, ...medecinTypes],
        isPrenatal: true,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: 28,
        maxPregnancyWeek: 42,
        colorCode: '#4CAF50',
        icon: 'fa-baby',
        sortOrder: 3,
        isActive: true
      },
      {
        name: 'consultation_grossesse_risque',
        nomType: 'Consultation grossesse à risque',
        description: 'Consultation spécialisée pour grossesse pathologique',
        durationMinutes: 60,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: true,
        requiresMidwife: false,
        requiresNurse: false,
        allowedPersonnelTypes: medecinTypes.filter(id => {
          const tp = typePersonnels.find(t => t.id === id)
          return tp && (tp.name.includes('gyneco') || tp.name.includes('obstetricien'))
        }),
        isPrenatal: true,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#FF9800',
        icon: 'fa-exclamation-triangle',
        sortOrder: 4,
        isActive: true
      },

      // CONSULTATIONS POSTNATALES
      {
        name: 'visite_postnatal_precoce',
        nomType: 'Visite postnatale précoce',
        description: 'Première visite postnatale (2-3 jours post-partum)',
        durationMinutes: 45,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: true,
        requiresNurse: false,
        allowedPersonnelTypes: [...sageFemmeTypes, ...medecinTypes],
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
        name: 'visite_postnatal_tardive',
        nomType: 'Visite postnatale tardive',
        description: 'Visite de contrôle à 6-8 semaines post-partum',
        durationMinutes: 30,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: true,
        requiresNurse: false,
        allowedPersonnelTypes: [...sageFemmeTypes, ...medecinTypes],
        isPrenatal: false,
        isPostnatal: true,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#2196F3',
        icon: 'fa-heart',
        sortOrder: 2,
        isActive: true
      },

      // VACCINATIONS
      {
        name: 'vaccination_nourrisson',
        nomType: 'Vaccination nourrisson',
        description: 'Vaccination selon calendrier vaccinal (0-2 ans)',
        durationMinutes: 15,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: false,
        requiresNurse: true,
        allowedPersonnelTypes: [...infirmierTypes, ...sageFemmeTypes, ...medecinTypes],
        isPrenatal: false,
        isPostnatal: false,
        isVaccination: true,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#9C27B0',
        icon: 'fa-syringe',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'vaccination_rattrapage',
        nomType: 'Vaccination de rattrapage',
        description: 'Vaccination de rattrapage pour enfants',
        durationMinutes: 20,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: false,
        requiresNurse: true,
        allowedPersonnelTypes: [...infirmierTypes, ...sageFemmeTypes, ...medecinTypes],
        isPrenatal: false,
        isPostnatal: false,
        isVaccination: true,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#9C27B0',
        icon: 'fa-syringe',
        sortOrder: 2,
        isActive: true
      },

      // CONSULTATIONS PÉDIATRIQUES
      {
        name: 'consultation_pediatrique',
        nomType: 'Consultation pédiatrique',
        description: 'Consultation médicale pour enfant',
        durationMinutes: 30,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: true,
        requiresMidwife: false,
        requiresNurse: false,
        allowedPersonnelTypes: typePersonnels.filter(tp => tp.name.includes('pediatre')).map(tp => tp.id),
        isPrenatal: false,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#607D8B',
        icon: 'fa-child',
        sortOrder: 1,
        isActive: true
      },

      // URGENCES
      {
        name: 'urgence_obstetricale',
        nomType: 'Urgence obstétricale',
        description: 'Urgence liée à la grossesse ou à l\'accouchement',
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
      },
      {
        name: 'urgence_pediatrique',
        nomType: 'Urgence pédiatrique',
        description: 'Urgence concernant un enfant ou nourrisson',
        durationMinutes: 45,
        requiresAppointment: false,
        isEmergency: true,
        requiresDoctor: true,
        requiresMidwife: false,
        requiresNurse: true,
        allowedPersonnelTypes: [...medecinTypes, ...infirmierTypes],
        isPrenatal: false,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#F44336',
        icon: 'fa-ambulance',
        sortOrder: 2,
        isActive: true
      },

      // SUIVIS SPÉCIALISÉS
      {
        name: 'suivi_allaitement',
        nomType: 'Consultation allaitement',
        description: 'Aide et suivi pour l\'allaitement maternel',
        durationMinutes: 30,
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
        colorCode: '#795548',
        icon: 'fa-baby',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'preparation_naissance',
        nomType: 'Préparation à la naissance',
        description: 'Séance de préparation à l\'accouchement et à la parentalité',
        durationMinutes: 60,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: false,
        requiresMidwife: true,
        requiresNurse: false,
        allowedPersonnelTypes: sageFemmeTypes,
        isPrenatal: true,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: 28,
        maxPregnancyWeek: 36,
        colorCode: '#795548',
        icon: 'fa-graduation-cap',
        sortOrder: 2,
        isActive: true
      }
    ])

    console.log(`   ✅ Created: ${visitTypes.length} types de visites`)
    
    // Grouper par catégorie
    const categoryGroups = {
      prenatal: visitTypes.filter(vt => vt.isPrenatal).length,
      postnatal: visitTypes.filter(vt => vt.isPostnatal).length,
      vaccination: visitTypes.filter(vt => vt.isVaccination).length,
      emergency: visitTypes.filter(vt => vt.isEmergency).length,
      general: visitTypes.filter(vt => !vt.isPrenatal && !vt.isPostnatal && !vt.isVaccination && !vt.isEmergency).length
    }
    
    Object.entries(categoryGroups).forEach(([category, count]) => {
      console.log(`      - ${category}: ${count} types`)
    })
  }

  private async showSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 RÉSUMÉ COMPLET DU SEEDING RBAC')
    console.log('='.repeat(60))

    const [
      categoriesCount,
      subcategoriesCount, 
      typePersonnelsCount,
      permissionsCount,
      rolesCount,
      rolePermissionsCount,
      visitTypesCount
    ] = await Promise.all([
      PersonnelCategory.query().count('* as total'),
      PersonnelSubcategory.query().count('* as total'),
      TypePersonnel.query().count('* as total'),
      Permission.query().count('* as total'),
      Role.query().count('* as total'),
      RolePermission.query().count('* as total'),
      TypeVisite.query().count('* as total')
    ])

    console.log('\n📋 STRUCTURE PERSONNEL:')
    console.log(`   • ${categoriesCount[0].$extras.total} catégories de personnel`)
    console.log(`   • ${subcategoriesCount[0].$extras.total} sous-catégories spécialisées`)
    console.log(`   • ${typePersonnelsCount[0].$extras.total} types de personnel détaillés`)

    console.log('\n🔐 SYSTÈME RBAC:')
    console.log(`   • ${permissionsCount[0].$extras.total} permissions granulaires`)
    console.log(`   • ${rolesCount[0].$extras.total} rôles système`)
    console.log(`   • ${rolePermissionsCount[0].$extras.total} associations rôles-permissions`)

    console.log('\n🏥 TYPES DE VISITES MÉDICALES:')
    console.log(`   • ${visitTypesCount[0].$extras.total} types de consultations/visites`)

    console.log('\n✨ FONCTIONNALITÉS DISPONIBLES:')
    console.log('   • Multi-tenant avec isolation des données')
    console.log('   • Permissions granulaires par module médical')
    console.log('   • Hiérarchie des rôles avec héritage')
    console.log('   • Délégation temporaire de permissions')
    console.log('   • Audit trail complet des actions')
    console.log('   • Support des urgences médicales')
    console.log('   • Gestion des prescriptions contrôlées')
    console.log('   • Contraintes de supervision médicale')
  }
}