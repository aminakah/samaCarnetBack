import Patient from '#models/patient'
import Personnel from '#models/personnel'
import Tenant from '#models/tenant'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    console.log('  🏥 Seeding medical visits...')
    
    // Récupérer les données nécessaires
    const patients = await Patient.query()
    const tenants = await Tenant.query()
    const tenantId = tenants[Math.floor(Math.random() * tenants.length)];
 
    const personnel = await Personnel.query()
    const typeVisites = await db.from('type_visite').select('*')
    
    console.log(`Found ${patients.length} patients, ${personnel.length} personnel, ${typeVisites.length} visit types, `)

    if (patients.length === 0 || personnel.length === 0 || typeVisites.length === 0) {
      console.log('⚠️  Insufficient data to create visits')
      return
    }

    const visitesToCreate = []
    const now = new Date()
    
    // Créer différents types de visites pour chaque patient
    for (const patient of patients) {
     
      
      // 1. Consultation prénatale (si grossesse active)
      if (patients) {
        const prenatalVisit = typeVisites.find(tv => tv.name === 'consultation_prenatal_1t')
        const midwife = personnel.find(p => p.typePersonnel.name === "sage-femme") || personnel[0].id // Sage-femme ou premier disponible
        
        if (prenatalVisit && midwife) {
          const visitDate = new Date(now.getTime() - (Math.random() * 30) * 24 * 60 * 60 * 1000) // Derniers 30 jours
          
          visitesToCreate.push({
            tenant_id: tenantId,
            patient_id: patient.id,
            personnel_id: midwife,
            type_visite_id: prenatalVisit.id,
            scheduled_at: visitDate,
            started_at: visitDate,
            ended_at: new Date(visitDate.getTime() + 45 * 60 * 1000), // 45 min
            duration_minutes: 45,
            status: 'completed',
            chief_complaint: 'Suivi prénatal de routine',
            physical_examination: 'Examen général normal, abdomen souple',
            diagnosis: 'Grossesse évolutive normale',
            treatment_plan: 'Poursuite du suivi mensuel',
            recommendations: 'Alimentation équilibrée, repos suffisant',
            notes: 'Patiente en forme, aucune complication détectée',
            weight_kg: 65.5 + Math.random() * 10,
            height_cm: 160 + Math.random() * 20,
            systolic_bp: 110 + Math.random() * 20,
            diastolic_bp: 70 + Math.random() * 15,
            heart_rate: 70 + Math.random() * 20,
            temperature_c: 36.5 + Math.random() * 1,
            pregnancy_week: 12 + Math.floor(Math.random() * 20),
            fundal_height_cm: 20 + Math.random() * 10,
            fetal_heart_rate: 140 + Math.random() * 20,
            fetal_movement: 'Mouvements fœtaux perçus normalement',
            cost: 15000.00, // 15 000 FCFA
            is_paid: true,
            paid_at: visitDate,
            created_at: visitDate,
            updated_at: visitDate
          })
        }
      }
      
      // 2. Consultation générale récente
      const generalVisit = typeVisites.find(tv => tv.name === 'consultation_generale')
      const doctor = personnel.find(p => p.typePersonnelId === 6) || personnel[0] // Médecin ou premier disponible
      
      if (generalVisit && doctor) {
        const visitDate = new Date(now.getTime() - (Math.random() * 60) * 24 * 60 * 60 * 1000) // Derniers 60 jours
        

        visitesToCreate.push({
          tenant_id: tenantId,
          patient_id: patient.id,
          personnel_id: doctor.id,
          type_visite_id: generalVisit.id,
          pregnancy_id: null,
          scheduled_at: visitDate,
          started_at: visitDate,
          ended_at: new Date(visitDate.getTime() + 30 * 60 * 1000), // 30 min
          duration_minutes: 30,
          status: 'completed',
          chief_complaint: 'Consultation de routine',
          physical_examination: 'Examen clinique complet, RAS',
          diagnosis: 'Bonne santé générale',
          treatment_plan: 'Aucun traitement spécifique',
          recommendations: 'Maintenir hygiène de vie, contrôle annuel',
          notes: 'Patiente en bonne santé',
          weight_kg: 60 + Math.random() * 25,
          height_cm: 155 + Math.random() * 25,
          systolic_bp: 120 + Math.random() * 20,
          diastolic_bp: 80 + Math.random() * 15,
          heart_rate: 75 + Math.random() * 15,
          temperature_c: 36.8 + Math.random() * 0.8,
          cost: 10000.00, // 10 000 FCFA
          is_paid: Math.random() > 0.2, // 80% payées
          paid_at: Math.random() > 0.2 ? visitDate : null,
          created_at: visitDate,
          updated_at: visitDate
        })
      }
      
      // 3. Visite prévue (future)
      if (Math.random() > 0.5) { // 50% de chance
        const futureVisitType = typeVisites[Math.floor(Math.random() * Math.min(5, typeVisites.length))]
        const availablePersonnel = personnel[Math.floor(Math.random() * personnel.length)]
        const futureDate = new Date(now.getTime() + (Math.random() * 30) * 24 * 60 * 60 * 1000) // Prochains 30 jours
        
        visitesToCreate.push({
          tenant_id: tenantId,
          patient_id: patient.id,
          personnel_id: availablePersonnel.id,
          type_visite_id: futureVisitType.id,
          // pregnancy_id: patientPregnancy?.id || null,
          scheduled_at: futureDate,
          started_at: null,
          ended_at: null,
          duration_minutes: null,
          status: 'scheduled',
          chief_complaint: null,
          physical_examination: null,
          diagnosis: null,
          treatment_plan: null,
          recommendations: null,
          notes: 'Rendez-vous programmé',
          cost: Math.random() > 0.5 ? 12000.00 : null,
          is_paid: false,
          paid_at: null,
          created_at: now,
          updated_at: now
        })
      }
    }

    if (visitesToCreate.length > 0) {
      // Calculer le BMI pour les visites où on a poids et taille
      visitesToCreate.forEach((visit: any) => {
        if (visit.weight_kg && visit.height_cm) {
          const heightM = visit.height_cm / 100
          visit.bmi = Math.round((visit.weight_kg / (heightM * heightM)) * 100) / 100
        }
      })

      await db.table('visite').insert(visitesToCreate)
      console.log(`✅ Created ${visitesToCreate.length} medical visits`)
      
      // Afficher un résumé par statut
      const statusSummary = visitesToCreate.reduce((acc, visit) => {
        acc[visit.status] = (acc[visit.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('📊 Visits summary by status:')
      for (const [status, count] of Object.entries(statusSummary)) {
        console.log(`   - ${status}: ${count} visits`)
      }
      
      // Résumé par type
      const typeSummary = visitesToCreate.reduce((acc, visit) => {
        const typeVisit = typeVisites.find(tv => tv.id === visit.type_visite_id)
        if (typeVisit) {
          acc[typeVisit.nom_type] = (acc[typeVisit.nom_type] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
      
      console.log('📊 Visits summary by type:')
      for (const [type, count] of Object.entries(typeSummary)) {
        console.log(`   - ${type}: ${count} visits`)
      }
    }
    
    console.log('✅ Medical visits seeded successfully')
  }
}