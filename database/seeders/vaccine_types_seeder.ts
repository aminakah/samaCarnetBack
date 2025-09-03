import { BaseSeeder } from '@adonisjs/lucid/seeders'
import VaccineType from '#models/vaccine_type'
import { v4 as uuidv4 } from 'uuid'

export default class VaccineTypesSeeder extends BaseSeeder {
  async run() {
    console.log('  💉 Seeding vaccine types...')
    
    const vaccineTypes = [
      // BCG - Tuberculose
      {
        name: 'BCG',
        code: 'BCG-001',
        description: 'Vaccin contre la tuberculose - Bacille de Calmette et Guérin',
        manufacturer: 'Institut Pasteur Dakar',
        brandName: 'BCG-IPD',
        vaccineType: 'live',
        targetGroup: 'infant',
        minAgeMonths: 0,
        maxAgeMonths: 12,
        route: 'intradermal',
        site: 'Bras droit, partie supérieure',
        doseVolume: 0.1,
        dosesRequired: 1,
        scheduleIntervals: [0], // À la naissance
        boosterIntervalMonths: null,
        requiresBooster: false,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 24,
        storageInstructions: 'Conserver entre 2-8°C, à l\'abri de la lumière',
        contraindications: [
          'Immunodéficience congénitale ou acquise',
          'Fièvre supérieure à 38°C',
          'Infection cutanée au site d\'injection'
        ],
        precautions: ['Prématurité < 2kg'],
        sideEffects: [
          'Rougeur locale',
          'Formation de pustule normale',
          'Cicatrice caractéristique'
        ],
        adverseReactions: ['Lymphadénite régionale rare'],
        diseasesPrevented: ['Tuberculose', 'Méningite tuberculeuse'],
        efficacyRate: '70-80%',
        immunityDurationYears: 10,
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 1,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // Pentavalent
      {
        name: 'DTC-HepB-Hib (Pentavalent)',
        code: 'PENTA-001',
        description: 'Vaccin pentavalent : Diphtérie, Tétanos, Coqueluche, Hépatite B, Haemophilus influenzae b',
        manufacturer: 'Serum Institute of India',
        brandName: 'Pentavac',
        vaccineType: 'inactivated',
        targetGroup: 'infant',
        minAgeMonths: 1.5, // 6 semaines
        maxAgeMonths: 18,
        route: 'intramuscular',
        site: 'Cuisse antérolatérale',
        doseVolume: 0.5,
        dosesRequired: 3,
        scheduleIntervals: [6, 10, 14], // 6, 10, 14 semaines
        boosterIntervalMonths: null,
        requiresBooster: false,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 36,
        storageInstructions: 'Conserver entre 2-8°C, ne pas congeler, agiter avant usage',
        contraindications: [
          'Allergie grave aux composants',
          'Encéphalopathie dans les 7 jours suivant DTC',
          'Maladie fébrile aiguë'
        ],
        precautions: ['Convulsions fébriles antérieures'],
        sideEffects: [
          'Fièvre légère (38-39°C)',
          'Douleur au point d\'injection',
          'Irritabilité'
        ],
        adverseReactions: ['Convulsions fébriles rares'],
        diseasesPrevented: [
          'Diphtérie',
          'Tétanos',
          'Coqueluche',
          'Hépatite B',
          'Infections à Haemophilus influenzae b'
        ],
        efficacyRate: '85-95%',
        immunityDurationYears: 10,
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 2,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // VPO - Polio Oral
      {
        name: 'VPO (Polio Oral)',
        code: 'OPV-001',
        description: 'Vaccin antipoliomyélitique oral - Types 1, 2 et 3',
        manufacturer: 'Sanofi Pasteur',
        brandName: 'Polio Oral',
        vaccineType: 'live',
        targetGroup: 'infant',
        minAgeMonths: 0,
        maxAgeMonths: 60,
        route: 'oral',
        site: 'Voie orale',
        doseVolume: 2, // 2 gouttes
        dosesRequired: 4,
        scheduleIntervals: [0, 6, 10, 14], // Naissance, 6, 10, 14 semaines
        boosterIntervalMonths: 18,
        requiresBooster: true,
        storageTempMin: -25,
        storageTempMax: -15,
        shelfLifeMonths: 24,
        storageInstructions: 'Conserver congelé, utiliser dans les 6 mois après décongélation',
        contraindications: [
          'Immunodéficience',
          'Diarrhée sévère',
          'Vomissements'
        ],
        precautions: ['Contact avec immunodéprimés'],
        sideEffects: ['Très rares'],
        adverseReactions: ['Paralysie associée au vaccin (extrêmement rare)'],
        diseasesPrevented: ['Poliomyélite'],
        efficacyRate: '95-99%',
        immunityDurationYears: null, // À vie
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 3,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // VAR - Rougeole
      {
        name: 'VAR (Rougeole)',
        code: 'MR-001',
        description: 'Vaccin contre la rougeole - virus vivant atténué',
        manufacturer: 'Serum Institute of India',
        brandName: 'Rouvax',
        vaccineType: 'live',
        targetGroup: 'child',
        minAgeMonths: 9,
        maxAgeMonths: 18,
        route: 'subcutaneous',
        site: 'Bras gauche',
        doseVolume: 0.5,
        dosesRequired: 2,
        scheduleIntervals: [9, 15], // 9 mois et 15-18 mois
        boosterIntervalMonths: null,
        requiresBooster: false,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 24,
        storageInstructions: 'Conserver entre 2-8°C, utiliser dans les 6h après reconstitution',
        contraindications: [
          'Immunodéficience',
          'Grossesse',
          'Allergie aux œufs',
          'Tuberculose active'
        ],
        precautions: ['Maladie fébrile'],
        sideEffects: [
          'Fièvre 5-12 jours après',
          'Éruption légère',
          'Malaise'
        ],
        adverseReactions: ['Convulsions fébriles rares'],
        diseasesPrevented: ['Rougeole'],
        efficacyRate: '85-95%',
        immunityDurationYears: null, // À vie
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 4,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // VAT - Tétanos Maternel
      {
        name: 'VAT (Tétanos Maternel)',
        code: 'TT-MAT-001',
        description: 'Vaccin antitétanique pour femmes enceintes',
        manufacturer: 'Serum Institute of India',
        brandName: 'Tetanol',
        vaccineType: 'toxoid',
        targetGroup: 'pregnant_women',
        minAgeMonths: 180, // 15 ans
        maxAgeMonths: 588, // 49 ans
        route: 'intramuscular',
        site: 'Deltoïde',
        doseVolume: 0.5,
        dosesRequired: 2,
        scheduleIntervals: [0, 4], // 0 et 4 semaines d'intervalle
        boosterIntervalMonths: 60, // 5 ans
        requiresBooster: true,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 36,
        storageInstructions: 'Conserver entre 2-8°C, agiter avant usage',
        contraindications: [
          'Allergie grave aux composants',
          'Réaction anaphylactique antérieure'
        ],
        precautions: ['Maladie fébrile sévère'],
        sideEffects: [
          'Douleur locale',
          'Rougeur',
          'Fièvre légère'
        ],
        adverseReactions: ['Réactions allergiques rares'],
        diseasesPrevented: ['Tétanos maternel', 'Tétanos néonatal'],
        efficacyRate: '95-100%',
        immunityDurationYears: 5,
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 1, // Très haute priorité pour grossesses
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // Fièvre Jaune
      {
        name: 'VAA (Fièvre Jaune)',
        code: 'YF-001',
        description: 'Vaccin contre la fièvre jaune - virus vivant atténué 17D',
        manufacturer: 'Institut Pasteur Dakar',
        brandName: 'Stamaril',
        vaccineType: 'live',
        targetGroup: 'child',
        minAgeMonths: 9,
        maxAgeMonths: 720, // Jusqu'à 60 ans pour première vaccination
        route: 'subcutaneous',
        site: 'Bras droit',
        doseVolume: 0.5,
        dosesRequired: 1,
        scheduleIntervals: [9], // 9 mois
        boosterIntervalMonths: null, // Protection à vie
        requiresBooster: false,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 24,
        storageInstructions: 'Conserver entre 2-8°C, utiliser dans les 6h après reconstitution',
        contraindications: [
          'Immunodéficience',
          'Allergie aux œufs',
          'Grossesse',
          'Âge > 60 ans (première vaccination)',
          'Dysfonction thymique'
        ],
        precautions: ['Âge > 60 ans', 'Maladie auto-immune'],
        sideEffects: [
          'Douleur au point d\'injection',
          'Fièvre légère 5-10 jours après',
          'Céphalées'
        ],
        adverseReactions: ['Réaction viscérotrope très rare'],
        diseasesPrevented: ['Fièvre jaune'],
        efficacyRate: '90-100%',
        immunityDurationYears: null, // À vie
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 2,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // VPI - Polio Injectable
      {
        name: 'VPI (Polio Injectable)',
        code: 'IPV-001',
        description: 'Vaccin antipoliomyélitique inactivé',
        manufacturer: 'Sanofi Pasteur',
        brandName: 'Imovax Polio',
        vaccineType: 'inactivated',
        targetGroup: 'infant',
        minAgeMonths: 2,
        maxAgeMonths: 18,
        route: 'intramuscular',
        site: 'Cuisse antérolatérale',
        doseVolume: 0.5,
        dosesRequired: 3,
        scheduleIntervals: [2, 4, 14], // 2, 4, 14 mois
        boosterIntervalMonths: 18,
        requiresBooster: true,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 36,
        storageInstructions: 'Conserver entre 2-8°C, ne pas congeler',
        contraindications: [
          'Allergie aux composants',
          'Maladie fébrile aiguë'
        ],
        precautions: ['Immunodéficience'],
        sideEffects: [
          'Douleur au point d\'injection',
          'Rougeur locale mineure'
        ],
        adverseReactions: ['Très rares'],
        diseasesPrevented: ['Poliomyélite'],
        efficacyRate: '95-99%',
        immunityDurationYears: 10,
        isWhoApproved: true,
        isNationalProgram: false, // Complément au VPO
        isMandatory: false,
        priorityLevel: 5,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      }
    ]

    await VaccineType.createMany( 
    [
      // BCG - Tuberculose
      {
        name: 'BCG',
        code: 'BCG-001',
        description: 'Vaccin contre la tuberculose - Bacille de Calmette et Guérin',
        manufacturer: 'Institut Pasteur Dakar',
        brandName: 'BCG-IPD',
        vaccineType: 'live',
        targetGroup: 'infant',
        minAgeMonths: 0,
        maxAgeMonths: 12,
        route: 'intradermal',
        site: 'Bras droit, partie supérieure',
        doseVolume: 0.1,
        dosesRequired: 1,
        scheduleIntervals: [0], // À la naissance
        boosterIntervalMonths: null,
        requiresBooster: false,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 24,
        storageInstructions: 'Conserver entre 2-8°C, à l\'abri de la lumière',
        contraindications: [
          'Immunodéficience congénitale ou acquise',
          'Fièvre supérieure à 38°C',
          'Infection cutanée au site d\'injection'
        ],
        precautions: ['Prématurité < 2kg'],
        sideEffects: [
          'Rougeur locale',
          'Formation de pustule normale',
          'Cicatrice caractéristique'
        ],
        adverseReactions: ['Lymphadénite régionale rare'],
        diseasesPrevented: ['Tuberculose', 'Méningite tuberculeuse'],
        efficacyRate: '70-80%',
        immunityDurationYears: 10,
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 1,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // Pentavalent
      {
        name: 'DTC-HepB-Hib (Pentavalent)',
        code: 'PENTA-001',
        description: 'Vaccin pentavalent : Diphtérie, Tétanos, Coqueluche, Hépatite B, Haemophilus influenzae b',
        manufacturer: 'Serum Institute of India',
        brandName: 'Pentavac',
        vaccineType: 'inactivated',
        targetGroup: 'infant',
        minAgeMonths: 1.5, // 6 semaines
        maxAgeMonths: 18,
        route: 'intramuscular',
        site: 'Cuisse antérolatérale',
        doseVolume: 0.5,
        dosesRequired: 3,
        scheduleIntervals: [6, 10, 14], // 6, 10, 14 semaines
        boosterIntervalMonths: null,
        requiresBooster: false,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 36,
        storageInstructions: 'Conserver entre 2-8°C, ne pas congeler, agiter avant usage',
        contraindications: [
          'Allergie grave aux composants',
          'Encéphalopathie dans les 7 jours suivant DTC',
          'Maladie fébrile aiguë'
        ],
        precautions: ['Convulsions fébriles antérieures'],
        sideEffects: [
          'Fièvre légère (38-39°C)',
          'Douleur au point d\'injection',
          'Irritabilité'
        ],
        adverseReactions: ['Convulsions fébriles rares'],
        diseasesPrevented: [
          'Diphtérie',
          'Tétanos',
          'Coqueluche',
          'Hépatite B',
          'Infections à Haemophilus influenzae b'
        ],
        efficacyRate: '85-95%',
        immunityDurationYears: 10,
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 2,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // VPO - Polio Oral
      {
        name: 'VPO (Polio Oral)',
        code: 'OPV-001',
        description: 'Vaccin antipoliomyélitique oral - Types 1, 2 et 3',
        manufacturer: 'Sanofi Pasteur',
        brandName: 'Polio Oral',
        vaccineType: 'live',
        targetGroup: 'infant',
        minAgeMonths: 0,
        maxAgeMonths: 60,
        route: 'oral',
        site: 'Voie orale',
        doseVolume: 2, // 2 gouttes
        dosesRequired: 4,
        scheduleIntervals: [0, 6, 10, 14], // Naissance, 6, 10, 14 semaines
        boosterIntervalMonths: 18,
        requiresBooster: true,
        storageTempMin: -25,
        storageTempMax: -15,
        shelfLifeMonths: 24,
        storageInstructions: 'Conserver congelé, utiliser dans les 6 mois après décongélation',
        contraindications: [
          'Immunodéficience',
          'Diarrhée sévère',
          'Vomissements'
        ],
        precautions: ['Contact avec immunodéprimés'],
        sideEffects: ['Très rares'],
        adverseReactions: ['Paralysie associée au vaccin (extrêmement rare)'],
        diseasesPrevented: ['Poliomyélite'],
        efficacyRate: '95-99%',
        immunityDurationYears: null, // À vie
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 3,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // VAR - Rougeole
      {
        name: 'VAR (Rougeole)',
        code: 'MR-001',
        description: 'Vaccin contre la rougeole - virus vivant atténué',
        manufacturer: 'Serum Institute of India',
        brandName: 'Rouvax',
        vaccineType: 'live',
        targetGroup: 'child',
        minAgeMonths: 9,
        maxAgeMonths: 18,
        route: 'subcutaneous',
        site: 'Bras gauche',
        doseVolume: 0.5,
        dosesRequired: 2,
        scheduleIntervals: [9, 15], // 9 mois et 15-18 mois
        boosterIntervalMonths: null,
        requiresBooster: false,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 24,
        storageInstructions: 'Conserver entre 2-8°C, utiliser dans les 6h après reconstitution',
        contraindications: [
          'Immunodéficience',
          'Grossesse',
          'Allergie aux œufs',
          'Tuberculose active'
        ],
        precautions: ['Maladie fébrile'],
        sideEffects: [
          'Fièvre 5-12 jours après',
          'Éruption légère',
          'Malaise'
        ],
        adverseReactions: ['Convulsions fébriles rares'],
        diseasesPrevented: ['Rougeole'],
        efficacyRate: '85-95%',
        immunityDurationYears: null, // À vie
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 4,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // VAT - Tétanos Maternel
      {
        name: 'VAT (Tétanos Maternel)',
        code: 'TT-MAT-001',
        description: 'Vaccin antitétanique pour femmes enceintes',
        manufacturer: 'Serum Institute of India',
        brandName: 'Tetanol',
        vaccineType: 'toxoid',
        targetGroup: 'pregnant_women',
        minAgeMonths: 180, // 15 ans
        maxAgeMonths: 588, // 49 ans
        route: 'intramuscular',
        site: 'Deltoïde',
        doseVolume: 0.5,
        dosesRequired: 2,
        scheduleIntervals: [0, 4], // 0 et 4 semaines d'intervalle
        boosterIntervalMonths: 60, // 5 ans
        requiresBooster: true,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 36,
        storageInstructions: 'Conserver entre 2-8°C, agiter avant usage',
        contraindications: [
          'Allergie grave aux composants',
          'Réaction anaphylactique antérieure'
        ],
        precautions: ['Maladie fébrile sévère'],
        sideEffects: [
          'Douleur locale',
          'Rougeur',
          'Fièvre légère'
        ],
        adverseReactions: ['Réactions allergiques rares'],
        diseasesPrevented: ['Tétanos maternel', 'Tétanos néonatal'],
        efficacyRate: '95-100%',
        immunityDurationYears: 5,
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 1, // Très haute priorité pour grossesses
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // Fièvre Jaune
      {
        name: 'VAA (Fièvre Jaune)',
        code: 'YF-001',
        description: 'Vaccin contre la fièvre jaune - virus vivant atténué 17D',
        manufacturer: 'Institut Pasteur Dakar',
        brandName: 'Stamaril',
        vaccineType: 'live',
        targetGroup: 'child',
        minAgeMonths: 9,
        maxAgeMonths: 720, // Jusqu'à 60 ans pour première vaccination
        route: 'subcutaneous',
        site: 'Bras droit',
        doseVolume: 0.5,
        dosesRequired: 1,
        scheduleIntervals: [9], // 9 mois
        boosterIntervalMonths: null, // Protection à vie
        requiresBooster: false,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 24,
        storageInstructions: 'Conserver entre 2-8°C, utiliser dans les 6h après reconstitution',
        contraindications: [
          'Immunodéficience',
          'Allergie aux œufs',
          'Grossesse',
          'Âge > 60 ans (première vaccination)',
          'Dysfonction thymique'
        ],
        precautions: ['Âge > 60 ans', 'Maladie auto-immune'],
        sideEffects: [
          'Douleur au point d\'injection',
          'Fièvre légère 5-10 jours après',
          'Céphalées'
        ],
        adverseReactions: ['Réaction viscérotrope très rare'],
        diseasesPrevented: ['Fièvre jaune'],
        efficacyRate: '90-100%',
        immunityDurationYears: null, // À vie
        isWhoApproved: true,
        isNationalProgram: true,
        isMandatory: true,
        priorityLevel: 2,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      },

      // VPI - Polio Injectable
      {
        name: 'VPI (Polio Injectable)',
        code: 'IPV-001',
        description: 'Vaccin antipoliomyélitique inactivé',
        manufacturer: 'Sanofi Pasteur',
        brandName: 'Imovax Polio',
        vaccineType: 'inactivated',
        targetGroup: 'infant',
        minAgeMonths: 2,
        maxAgeMonths: 18,
        route: 'intramuscular',
        site: 'Cuisse antérolatérale',
        doseVolume: 0.5,
        dosesRequired: 3,
        scheduleIntervals: [2, 4, 14], // 2, 4, 14 mois
        boosterIntervalMonths: 18,
        requiresBooster: true,
        storageTempMin: 2,
        storageTempMax: 8,
        shelfLifeMonths: 36,
        storageInstructions: 'Conserver entre 2-8°C, ne pas congeler',
        contraindications: [
          'Allergie aux composants',
          'Maladie fébrile aiguë'
        ],
        precautions: ['Immunodéficience'],
        sideEffects: [
          'Douleur au point d\'injection',
          'Rougeur locale mineure'
        ],
        adverseReactions: ['Très rares'],
        diseasesPrevented: ['Poliomyélite'],
        efficacyRate: '95-99%',
        immunityDurationYears: 10,
        isWhoApproved: true,
        isNationalProgram: false, // Complément au VPO
        isMandatory: false,
        priorityLevel: 5,
        status: 'active',
        syncId: uuidv4(),
        version: 1,
        isSynced: false
      }
    ])
    
  }
}