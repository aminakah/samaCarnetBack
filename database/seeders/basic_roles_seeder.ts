import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
// import Permission from '#models/permission' // Unused import
import TypePersonnel from '#models/type_personnel'

export default class extends BaseSeeder {
  async run() {
    console.log('  🔐 Seeding basic roles...')
    
    // Récupérer les types de personnel
    const typePersonnels = await TypePersonnel.all()
    console.log(`Found ${typePersonnels.length} personnel types`)

    // Créer les rôles système de base (sans metadata ni conditions JSON)
    const roles = await Role.createMany([
      {
        tenantId: null,
        name: 'sage_femme_junior',
        displayName: 'Sage-femme Junior',
        description: 'Rôle pour sage-femme débutante',
        level: 1,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'sage_femme_junior')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'sage_femme',
        displayName: 'Sage-femme',
        description: 'Rôle pour sage-femme confirmée',
        level: 2,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'sage_femme')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'sage_femme_senior',
        displayName: 'Sage-femme Senior',
        description: 'Rôle pour sage-femme senior',
        level: 3,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'sage_femme_senior')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'gyneco_obstetricien',
        displayName: 'Gynéco-obstétricien',
        description: 'Médecin gynéco-obstétricien',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'gyneco_obstetricien')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'medecin_generaliste',
        displayName: 'Médecin Généraliste',
        description: 'Médecin généraliste',
        level: 2,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'medecin_generaliste')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'pediatre',
        displayName: 'Pédiatre',
        description: 'Médecin pédiatre',
        level: 3,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'pediatre')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'infirmier',
        displayName: 'Infirmier/ère',
        description: 'Personnel infirmier',
        level: 2,
        isSystem: true,
        isMedical: true,
        isAdministrative: false,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'infirmier')?.id || null,
        maxUsers: null,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'directeur_medical',
        displayName: 'Directeur Médical',
        description: 'Directeur médical',
        level: 4,
        isSystem: true,
        isMedical: true,
        isAdministrative: true,
        typePersonnelId: typePersonnels.find(tp => tp.name === 'directeur_medical')?.id || null,
        maxUsers: 1,
        isActive: true,
        isAssignable: true
      },
      {
        tenantId: null,
        name: 'super_admin',
        displayName: 'Super Administrateur',
        description: 'Super administrateur système',
        level: 5,
        isSystem: true,
        isMedical: false,
        isAdministrative: true,
        typePersonnelId: null,
        maxUsers: 5,
        isActive: true,
        isAssignable: true
      }
    ])

    console.log(`✅ Created ${roles.length} roles successfully`)

    // Afficher un résumé
    const medical = roles.filter(r => r.isMedical && !r.isAdministrative).length
    const administrative = roles.filter(r => r.isAdministrative && !r.isMedical).length
    const mixed = roles.filter(r => r.isMedical && r.isAdministrative).length
    
    console.log('📈 Résumé des rôles:')
    console.log(`   - Médicaux: ${medical}`)
    console.log(`   - Administratifs: ${administrative}`)
    console.log(`   - Mixtes: ${mixed}`)
    
    console.log('ℹ️  Note: Permissions role assignments skipped to avoid JSON serialization issues')
  }
}