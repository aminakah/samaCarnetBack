import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Tenant from '#models/tenant'

export default class TenantsSeeder extends BaseSeeder {
  async run() {
    console.log('  📋 Seeding tenants...')
    
    // const tenants = 
  

    const tenants = [
      {
        name: 'Centre de Santé Dakar',
        subdomain: 'dakar-health',
        domain: null,
        email: 'admin@dakar-health.sn',
        phone: '+221 33 889 00 00',
        address: 'Plateau, Dakar, Sénégal',
        settings: JSON.stringify({
          language: 'fr',
          timezone: 'Africa/Dakar',
          features: ['pregnancies', 'vaccinations', 'consultations'],
          workingHours: '08:00-18:00',
          appointmentDuration: 30
        }),
        status: 'active' as const,
        subscriptionPlan: 'premium' as const
      },
      {
        name: 'Clinique Almadies',
        subdomain: 'almadies',
        domain: null,
        email: 'contact@almadies-clinic.sn',
        phone: '+221 33 820 15 15',
        address: 'Almadies, Dakar, Sénégal',
        settings: JSON.stringify({
          language: 'fr',
          timezone: 'Africa/Dakar',
          features: ['pregnancies', 'vaccinations'],
          workingHours: '07:30-19:00',
          appointmentDuration: 45
        }),
        status: 'active' as const,
        subscriptionPlan: 'basic' as const
      },
      {
        name: 'Hôpital Régional de Thiès',
        subdomain: 'thies',
        domain: null,
        email: 'admin@hopital-thies.sn',
        phone: '+221 33 951 10 20',
        address: 'Thiès, Sénégal',
        settings: JSON.stringify({
          language: 'wo',
          timezone: 'Africa/Dakar',
          features: ['pregnancies', 'vaccinations', 'consultations'],
          workingHours: '24/7',
          appointmentDuration: 30
        }),
        status: 'active' as const,
        subscriptionPlan: 'enterprise'
      },
      {
        name: 'Clinique Démo Sénégal',
        subdomain: 'demo',
        domain: null,
        email: 'contact@demo.sn',
        phone: '+221 33 123 45 67',
        address: 'Dakar, Sénégal',
        settings: JSON.stringify({
          language: 'fr',
          timezone: 'Africa/Dakar',
          features: ['pregnancies', 'vaccinations', 'consultations'],
          demoMode: true,
          workingHours: '08:00-17:00',
          appointmentDuration: 30
        }),
        status: 'active' as const,
        subscriptionPlan: 'basic' as const
      }
    ]

    for (const tenantData of tenants) {
      await Tenant.updateOrCreate(
        { subdomain: tenantData.subdomain },
        tenantData
      )
    }
  }
}