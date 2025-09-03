import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PersonnelCategory from '#models/personnel_category'
import PersonnelSubcategory from '#models/personnel_subcategory'
import TypePersonnel from '#models/type_personnel'

export default class extends BaseSeeder {
  async run() {
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
      {
        categoryId: categories[0].id, // medical
        name: 'anesthesie',
        nomSubcategory: 'Anesthésie',
        description: 'Anesthésie-réanimation',
        requiresSpecialization: true,
        sortOrder: 4,
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
      {
        categoryId: categories[1].id, // paramedical
        name: 'soins_specialises',
        nomSubcategory: 'Soins Spécialisés',
        description: 'Soins infirmiers spécialisés',
        requiresSpecialization: true,
        sortOrder: 2,
        isActive: true
      },
      {
        categoryId: categories[1].id, // paramedical
        name: 'reeducation',
        nomSubcategory: 'Rééducation',
        description: 'Kinésithérapie et rééducation',
        requiresSpecialization: true,
        sortOrder: 3,
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
        subcategoryId: subcategories[4].id, // soins_generaux
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
        subcategoryId: subcategories[4].id, // soins_generaux
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
        subcategoryId: subcategories[7].id, // direction
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
        subcategoryId: subcategories[8].id, // gestion
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
        subcategoryId: subcategories[9].id, // accueil
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

    console.log('✅ Personnel categories, subcategories and types seeded successfully')
    console.log(`📊 Created: ${categories.length} categories, ${subcategories.length} subcategories, ${typePersonnels.length} personnel types`)
  }
}