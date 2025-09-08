import { BaseSeeder } from '@adonisjs/lucid/seeders'
import VisitHistory from '#models/visit_history'
import Visite from '#models/visite'
import { DateTime } from 'luxon'

export default class VisitHistoriesSeeder extends BaseSeeder {
  async run() {
    console.log('  📋 Seeding visit histories...')
    
    const visits = await Visite.query().preload('personnel')
    
    for (const visit of visits) {
      // Create history for visit creation
      await VisitHistory.create({
        visitId: visit.id,
        modifiedBy: visit.personnelId,
        action: 'created',
        changes: {
          status: 'scheduled',
          scheduledAt: visit.scheduledAt
        },
        reason: 'Initial visit creation',
        actionDate: visit.createdAt
      })
      
      // If visit is completed, add completion history
      if (visit.status === 'completed') {
        await VisitHistory.create({
          visitId: visit.id,
          modifiedBy: visit.personnelId,
          action: 'completed',
          changes: {
            status: 'completed',
            endedAt: visit.endedAt
          },
          reason: 'Visit completed successfully',
          actionDate: visit.endedAt || DateTime.now()
        })
      }
    }

    console.log('✅ Visit histories seeded successfully')
  }
}