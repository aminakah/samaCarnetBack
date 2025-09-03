import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class DevSeeder extends BaseSeeder {
  async run() {
    console.log('🌱 Starting development data seeding...')

    // Run all individual seeders in order
    await this.exec(await import('./tenants_seeder.js'))
    await this.exec(await import('./users_seeder.js'))
    await this.exec(await import('./vaccine_types_seeder.js'))
    await this.exec(await import('./vaccine_schedules_seeder.js'))
    // Removed: pregnancies, consultations, vaccinations seeders
    await this.exec(await import('./sync_logs_seeder.js'))

    console.log('✅ Development data seeded successfully!')
    console.log('')
    console.log('🔑 Available test accounts:')
    console.log('📋 Tenant 1 - Centre de Santé Dakar (x-tenant-id: 1)')
    console.log('   👑 Admin: admin@dakar-health.sn / Admin123!')
    console.log('   👨‍⚕️ Doctor: mamadou.seck@dakar-health.sn / Doctor123!')
    console.log('   👩‍⚕️ Midwife: fatou.ba@dakar-health.sn / Midwife123!')
    console.log('   🤰 Patient 1: aicha.ndiaye@gmail.com / Patient123!')
    console.log('   🤰 Patient 2: khadija.thiam@gmail.com / Patient123!')
    console.log('')
    console.log('📋 Tenant 2 - Clinique Almadies (x-tenant-id: 2)')
    console.log('   👨‍⚕️ Admin/Doctor: oumar.faye@almadies-clinic.sn / Admin123!')
    console.log('   👩‍⚕️ Midwife: mariama.sy@almadies-clinic.sn / Midwife123!')
    console.log('')
    console.log('📋 Tenant 4 - Demo (x-tenant-id: 4)')
    console.log('   👑 Admin: admin@demo.sn / Admin123!')
    console.log('   👨‍⚕️ Doctor: doctor@demo.sn / Doctor123!')
    console.log('   👩‍⚕️ Midwife: midwife@demo.sn / Midwife123!')
    console.log('   🤰 Patient: patient@demo.sn / Patient123!')
    console.log('')
    console.log('📊 Data included:')
    console.log('   • 4 Tenants with different configurations')
    console.log('   • 12 Users across all roles')
    console.log('   • 8 Vaccine types (PEV Sénégal)')
    console.log('   • 5 Pregnancies (active + completed)')
    console.log('   • 5 Consultations (routine + emergency)')
    console.log('   • 10 Vaccine schedules')
    console.log('   • 7 Vaccinations administered')
    console.log('   • 14 Sync logs (various scenarios)')
  }

  /**
   * Execute a seeder class
   */
  private async exec(seederModule: any) {
    const SeederClass = seederModule.default
    const seeder = new SeederClass(this.client, this.file as any, this.logger as any)
    await seeder.run()
  }
}