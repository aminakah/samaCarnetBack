import { BaseSeeder } from '@adonisjs/lucid/seeders'
import TypeVisite from '#models/type_visite'
import TypePersonnel from '#models/type_personnel'

export default class extends BaseSeeder {
  async run() {
    // Récupérer les types de personnel pour les contraintes
    const typePersonnels = await TypePersonnel.all()
    const sageFemmeTypes = typePersonnels.filter(tp => tp.name.includes('sage_femme')).map(tp => tp.id)
    const medecinTypes = typePersonnels.filter(tp => tp.name.includes('medecin') || tp.name.includes('gyneco') || tp.name.includes('pediatre')).map(tp => tp.id)
    const infirmierTypes = typePersonnels.filter(tp => tp.name.includes('infirmier')).map(tp => tp.id)
    const allMedicalTypes = typePersonnels.filter(tp => tp.isMedicalStaff).map(tp => tp.id)

    const typeVisites = await TypeVisite.createMany([
      // VISITES PRÉNATALES
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
        description: 'Consultation du deuxième trimestre (14-27 semaines)',
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
        description: 'Consultation du troisième trimestre (28-40 semaines)',
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
        name: 'consultation_prenatal_risque',
        nomType: 'Consultation grossesse à risque',
        description: 'Consultation spécialisée pour grossesse à haut risque',
        durationMinutes: 60,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: true,
        requiresMidwife: false,
        requiresNurse: false,
        allowedPersonnelTypes: medecinTypes,
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

      // VISITES POSTNATALES
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
        name: 'visite_postnatal_6sem',
        nomType: 'Visite postnatale 6 semaines',
        description: 'Visite de contrôle à 6 semaines post-partum',
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
        name: 'vaccination_routine',
        nomType: 'Vaccination de routine',
        description: 'Vaccination selon calendrier vaccinal',
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
        description: 'Vaccination de rattrapage pour enfant',
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

      // CONSULTATIONS GÉNÉRALES
      {
        name: 'consultation_generale',
        nomType: 'Consultation générale',
        description: 'Consultation médicale générale',
        durationMinutes: 30,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: true,
        requiresMidwife: false,
        requiresNurse: false,
        allowedPersonnelTypes: medecinTypes,
        isPrenatal: false,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#607D8B',
        icon: 'fa-stethoscope',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'consultation_pediatrique',
        nomType: 'Consultation pédiatrique',
        description: 'Consultation spécialisée en pédiatrie',
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
        sortOrder: 2,
        isActive: true
      },

      // URGENCES
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
      },
      {
        name: 'urgence_pediatrique',
        nomType: 'Urgence pédiatrique',
        description: 'Urgence concernant un enfant',
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
      {
        name: 'urgence_generale',
        nomType: 'Urgence générale',
        description: 'Urgence médicale générale',
        durationMinutes: 30,
        requiresAppointment: false,
        isEmergency: true,
        requiresDoctor: true,
        requiresMidwife: false,
        requiresNurse: true,
        allowedPersonnelTypes: allMedicalTypes,
        isPrenatal: false,
        isPostnatal: false,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#F44336',
        icon: 'fa-ambulance',
        sortOrder: 3,
        isActive: true
      },

      // SUIVIS SPÉCIALISÉS
      {
        name: 'suivi_allaitement',
        nomType: 'Suivi allaitement',
        description: 'Consultation d\'aide et suivi pour l\'allaitement',
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
        name: 'preparation_accouchement',
        nomType: 'Préparation à l\'accouchement',
        description: 'Séance de préparation à l\'accouchement',
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
      },

      // CONTRÔLES
      {
        name: 'controle_post_operatoire',
        nomType: 'Contrôle post-opératoire',
        description: 'Contrôle après intervention chirurgicale',
        durationMinutes: 20,
        requiresAppointment: true,
        isEmergency: false,
        requiresDoctor: true,
        requiresMidwife: false,
        requiresNurse: false,
        allowedPersonnelTypes: medecinTypes,
        isPrenatal: false,
        isPostnatal: true,
        isVaccination: false,
        minPregnancyWeek: null,
        maxPregnancyWeek: null,
        colorCode: '#FF5722',
        icon: 'fa-bandage',
        sortOrder: 1,
        isActive: true
      }
    ])

    console.log('✅ Type visites seeded successfully')
    console.log(`📊 Created: ${typeVisites.length} visit types`)
    
    // Afficher un résumé par catégorie
    const categorySummary = {
      prenatal: typeVisites.filter(tv => tv.isPrenatal).length,
      postnatal: typeVisites.filter(tv => tv.isPostnatal).length,
      vaccination: typeVisites.filter(tv => tv.isVaccination).length,
      emergency: typeVisites.filter(tv => tv.isEmergency).length,
      general: typeVisites.filter(tv => !tv.isPrenatal && !tv.isPostnatal && !tv.isVaccination && !tv.isEmergency).length
    }
    
    console.log('📈 Types de visites par catégorie:')
    console.log(`   - Prénatales: ${categorySummary.prenatal}`)
    console.log(`   - Postnatales: ${categorySummary.postnatal}`)
    console.log(`   - Vaccinations: ${categorySummary.vaccination}`)
    console.log(`   - Urgences: ${categorySummary.emergency}`)
    console.log(`   - Générales: ${categorySummary.general}`)
  }
}