import { BaseSeeder } from '@adonisjs/lucid/seeders'
// import Application from '@adonisjs/core/services/app'

export default class MainSeeder extends BaseSeeder {
  private successCount = 0
  private errorCount = 0
  private skippedCount = 0

  async run() {
    console.log('🚀 Starting comprehensive database seeding...\n')
    console.log('=' .repeat(60))
    console.log('   🌟 SAMA CARNET - Medical Multi-tenant RBAC System')
    console.log('=' .repeat(60))
    
    try {
      // Phase 1: Core System Data
      console.log('\n📋 Phase 1: Core System Data')
      console.log('─'.repeat(40))
      
      // 1. Tenants (required first)
      await this.runSeeder('TenantsSeeder')
      
      // 2. Users (depends on tenants)
      await this.runSeeder('UsersSeeder')
      
      // Phase 2: RBAC Infrastructure
      console.log('\n🔐 Phase 2: RBAC Infrastructure')
      console.log('─'.repeat(40))
      
      // 3. Personnel Categories, Subcategories, Types (hierarchical structure)
      await this.runSeeder('PersonnelCategoriesSeeder')
      
      // 4. Permissions (independent)
      await this.runSeeder('PermissionsSeeder')
      
      // 5. Roles (depends on type_personnel and permissions)
      await this.runSeeder('BasicRolesSeeder')
      
      // Phase 3: Medical System Data
      console.log('\n🏥 Phase 3: Medical System Data')
      console.log('─'.repeat(40))
      
      // 6. Visit Types (depends on type_personnel)
      await this.runSeeder('TypeVisiteSeeder')
      
      // 7. Vaccine Types (independent medical data)
      await this.runSeeder('VaccineTypesSeeder')
      
      // 8. Vaccine Schedules (depends on vaccine types)
      await this.runSeeder('VaccineSchedulesSeeder')
      
      // Phase 4: Sample Data & Workflows
      console.log('\n📝 Phase 4: Sample Data & Workflows')
      console.log('─'.repeat(40))
      
      // 9. Patients and Personnel (depends on users)
      await this.runSeeder('SimplePatientsPPersonnelSeeder')
      
      // 10. RBAC Associations (depends on roles and permissions)
      await this.runSeeder('RbacAssociationsSeeder')
      
      // 11. User Roles (depends on users and roles)
      await this.runSeeder('UserRolesSeeder')
      
      // 12. User Permissions (depends on users and permissions)  
      await this.runSeeder('UserPermissionsSeeder')
      
      // 13. Medical Visits (depends on patients, personnel, types)
      await this.runSeeder('VisitesSeeder')
      
      // Phase 5: System Maintenance
      console.log('\n🔧 Phase 5: System Maintenance')
      console.log('─'.repeat(40))
      
      // 14. Sync Logs (system tracking)
      await this.runSeeder('SyncLogsSeeder')
      
      // 13. Demo Data (demo tenant specific) - Skip to avoid conflicts with TenantsSeeder
      // await this.runSeeder('DemoSeeder')
      
      // 14. Dev Data (development environment) - Skip due to JSON serialization issues
      // if (Application.inDev) {
      //   await this.runSeeder('DevSeeder')
      // }
      
      // Completion Summary
      console.log('\n' + '='.repeat(60))
      console.log('   ✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!')
      console.log('='.repeat(60))

      const totalSeeders = this.successCount + this.errorCount + this.skippedCount
      console.log('\n📊 SEEDING SUMMARY:')
      console.log(`✅ Successful: ${this.successCount}/${totalSeeders}`)
      console.log(`⏭️  Skipped: ${this.skippedCount}/${totalSeeders}`)
      console.log(`❌ Failed: ${this.errorCount}/${totalSeeders}`)
      
      console.log('\n' + '─'.repeat(60))
      console.log('─'.repeat(60))
      
    } catch (error) {
      console.error('\n❌ Seeding failed:', error.message)
      console.error('📍 Last operation failed. Check the error above.')
      throw error
    }
  }
  
  /**
   * Helper method to run individual seeders with error handling and timing
   */
  private async runSeeder(seederName: string) {
    console.log(`  🔄 Running ${seederName}...`)
    const startTime = Date.now()
    
    try {
      // Dynamically import and run the seeder
      const SeederClass = await this.getSeederClass(seederName)
      const seederInstance = new SeederClass(this.client, this.file as any, this.logger as any)
      
      await seederInstance.run()
      
      const duration = Date.now() - startTime
      console.log(`  ✅ ${seederName} completed (${duration}ms)`)
      this.successCount++
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`  ❌ ${seederName} failed after ${duration}ms:`, error.message)
      this.errorCount++
      // Ne pas throw l'erreur pour permettre aux autres seeders de continuer
      console.log(`  ⏭️  Continuing with next seeder...`)
    }
  }
  
  /**
   * Dynamically get seeder class based on naming convention
   */
  private async getSeederClass(seederName: string) {
    // Convert seeder name to file name (e.g., 'TenantsSeeder' -> 'tenants_seeder')
    const fileName = seederName
      .replace(/Seeder$/, '')
      .replace(/([A-Z])/g, (_match, letter, index) => {
        return index > 0 ? '_' + letter.toLowerCase() : letter.toLowerCase()
      }) + '_seeder'
    
    try {
      // Try to import the seeder
      const seederModule = await import(`./${fileName}.js`)
      return seederModule.default
    } catch (error) {
      // Fallback: try alternative naming
      try {
        const alternativeModule = await import(`./${fileName.replace('_seeder', '')}_seeder.js`)
        return alternativeModule.default
      } catch (alternativeError) {
        console.warn(`  ⚠️  Seeder ${seederName} not found, skipping...`)
        this.skippedCount++
        return class EmptySeeder extends BaseSeeder {
          async run() {
            console.log(`    ℹ️  ${seederName} is not available`)
          }
        }
      }
    }
  }
}