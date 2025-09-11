import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PersonnelCategory from '#models/personnel_category'
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
      },
      // Sous-catégories médicales
      {
        name: 'obstetrique',
        nomCategory: 'Obstétrique',
        description: 'Spécialité obstétrique et gynécologie',
        colorCode: '#E91E63',
        icon: 'fa-baby',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'pediatrie',
        nomCategory: 'Pédiatrie',
        description: 'Spécialité pédiatrique',
        colorCode: '#FF9800',
        icon: 'fa-child',
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'medecine_generale',
        nomCategory: 'Médecine Générale',
        description: 'Médecine générale',
        colorCode: '#4CAF50',
        icon: 'fa-stethoscope',
        sortOrder: 3,
        isActive: true
      },
      // Sous-catégories paramédicales
      {
        name: 'soins_generaux',
        nomCategory: 'Soins Généraux',
        description: 'Soins infirmiers généraux',
        colorCode: '#2196F3',
        icon: 'fa-user-nurse',
        sortOrder: 1,
        isActive: true
      },
      // Sous-catégories administratives
      {
        name: 'direction',
        nomCategory: 'Direction',
        description: 'Direction et management',
        colorCode: '#795548',
        icon: 'fa-user-tie',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'gestion',
        nomCategory: 'Gestion',
        description: 'Gestion administrative',
        colorCode: '#607D8B',
        icon: 'fa-clipboard',
        sortOrder: 2,
        isActive: true
      }
    ])

    // Créer les types de personnel détaillés
    const typePersonnels = await TypePersonnel.createMany([
      // MEDICAL - Obstétrique
      {
        categoryId: categories.find(c => c.name === 'medical')?.id,
        subcategoryId: categories.find(c => c.name === 'obstetrique')?.id,
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
        categoryId: categories.find(c => c.name === 'medical')?.id,
        subcategoryId: categories.find(c => c.name === 'obstetrique')?.id,
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
        categoryId: categories.find(c => c.name === 'medical')?.id,
        subcategoryId: categories.find(c => c.name === 'obstetrique')?.id,
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
        sortOrder: 3,
        isActive: true
      },
      // MEDICAL - Médecine générale
      {
        categoryId: categories.find(c => c.name === 'medical')?.id,
        subcategoryId: categories.find(c => c.name === 'medecine_generale')?.id,
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
        categoryId: categories.find(c => c.name === 'paramedical')?.id,
        subcategoryId: categories.find(c => c.name === 'soins_generaux')?.id,
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
      // ADMINISTRATIF - Direction
      {
        categoryId: categories.find(c => c.name === 'administratif')?.id,
        subcategoryId: categories.find(c => c.name === 'direction')?.id,
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
        categoryId: categories.find(c => c.name === 'administratif')?.id,
        subcategoryId: categories.find(c => c.name === 'gestion')?.id,
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
      }
    ])

    console.log('✅ Personnel categories and types seeded successfully')
    console.log(`📊 Created: ${categories.length} categories, ${typePersonnels.length} personnel types`)
  }
}