import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SyncLog from '#models/sync_log'
import { DateTime } from 'luxon'

export default class SyncLogsSeeder extends BaseSeeder {
  async run() {
    console.log('  🔄 Seeding sync logs...')
    
    // const syncLogs = 

    await SyncLog.createMany([
      // Logs de sync pour Aïcha Ndiaye
      {
        tenantId: 1,
        userId: 1, // Aïcha
        syncSessionId: 'sync-aicha-001',
        syncType: 'pull',
        syncTrigger: 'automatic',
        entityType: 'pregnancy',
        entityId: 'uuid-pregnancy-001',
        operation: 'update',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        clientData: { 
          action: 'fetch_pregnancy_data',
          pregnancyId: 1,
          lastUpdate: DateTime.now().minus({ hours: 6 }).toISO()
        },
        hadConflict: false,
        conflictType: null,
        resolutionStrategy: null,
        status: 'success',
        errorMessage: null,
        startedAt: DateTime.now().minus({ hours: 6 }),
        completedAt: DateTime.now().minus({ hours: 6 })
      },
      {
        tenantId: 1,
        userId: 1, // Aïcha
        syncSessionId: 'sync-aicha-002',
        syncType: 'pull',
        syncTrigger: 'automatic',
        entityType: 'consultation',
        entityId: 'uuid-consultation-001',
        operation: 'update',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        clientData: { 
          action: 'fetch_consultation_data',
          consultationId: 1,
          doctorId: 2,
          lastUpdate: DateTime.now().minus({ hours: 5 }).toISO()
        },
        hadConflict: false,
        conflictType: null,
        resolutionStrategy: null,
        status: 'success',
        errorMessage: null,
        startedAt: DateTime.now().minus({ hours: 5 }),
        completedAt: DateTime.now().minus({ hours: 5 })
      },
      {
        tenantId: 1,
        userId: 1, // Aïcha
        syncSessionId: 'sync-aicha-003',
        syncType: 'push',
        syncTrigger: 'manual',
        entityType: 'patient_notes',
        entityId: 'uuid-patient-notes-001',
        operation: 'conflict',
        clientVersion: 2,
        serverVersion: 1,
        resolvedVersion: 2,
        clientData: { 
          action: 'update_patient_notes',
          notes: 'Questions préparation accouchement + liste maternité',
          conflictField: 'notes'
        },
        serverData: {
          notes: 'Questions préparation accouchement'
        },
        resolvedData: {
          notes: 'Questions préparation accouchement + liste maternité'
        },
        hadConflict: true,
        conflictType: 'data',
        resolutionStrategy: 'client_wins',
        status: 'success',
        errorMessage: null,
        startedAt: DateTime.now().minus({ hours: 2, minutes: 30 }),
        completedAt: DateTime.now().minus({ hours: 2 })
      },

      // Logs de sync pour Khadija Thiam
      {
        tenantId: 1,
        userId: 1, // Khadija
        syncSessionId: 'sync-khadija-001',
        syncType: 'pull',
        syncTrigger: 'automatic',
        entityType: 'pregnancy',
        entityId: 'uuid-pregnancy-002',
        operation: 'update',
        clientVersion: 3,
        serverVersion: 3,
        resolvedVersion: 3,
        clientData: { 
          action: 'fetch_pregnancy_updates',
          pregnancyId: 2,
          urgentUpdate: true,
          riskLevel: 'high'
        },
        hadConflict: false,
        conflictType: null,
        resolutionStrategy: null,
        status: 'success',
        errorMessage: null,
        startedAt: DateTime.now().minus({ hours: 1 }),
        completedAt: DateTime.now().minus({ hours: 1 })
      },
      {
        tenantId: 1,
        userId: 1, // Khadija
        syncType: 'pull',
        syncTrigger: 'automatic',
        operation: 'update',
        entityType: 'consultation',
        entityId: 'uuid-consultation-002',
        syncSessionId: 'sync-khadija-002',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        hadConflict: false,
        conflictType: null,
        status: 'success',
        resolutionStrategy: null,
        errorMessage: null,
        clientData: { 
          action: 'emergency_consultation_sync',
          consultationId: 3,
          consultationType: 'emergency',
          diagnosis: 'pré-éclampsie sévère'
        },
        startedAt: DateTime.now().minus({ hours: 1 }),
        completedAt: DateTime.now().minus({ hours: 1 })
      },
      {
        tenantId: 1,
        userId: 1, // Khadija
        syncType: 'push',
        syncTrigger: 'manual',
        operation: 'update',
        entityType: 'patient_vitals',
        entityId: 'uuid-patient-vitals-001',
        syncSessionId: 'sync-khadija-003',
        clientVersion: 1,
        serverVersion: 1,
        status: 'failed',
        resolutionStrategy: null,
        errorMessage: 'Network timeout during emergency sync',
        clientData: { 
          action: 'push_vitals_emergency',
          bloodPressure: '165/105',
          symptoms: 'Céphalées intenses',
          timestamp: DateTime.now().minus({ minutes: 30 }).toISO()
        },
        startedAt: DateTime.now().minus({ minutes: 30 }),
        completedAt: null
      },

      // Logs de sync pour Dr. Mamadou Seck
      {
        tenantId: 1,
        userId: 1, // Dr. Seck
        syncType: 'push',
        syncTrigger: 'manual',
        operation: 'update',
        entityType: 'consultation',
        entityId: 'uuid-consultation-003',
        syncSessionId: 'sync-doctor-001',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        hadConflict: false,
        conflictType: null,
        status: 'success',
        resolutionStrategy: null,
        errorMessage: null,
        clientData: { 
          action: 'create_consultation',
          patientId: 4,
          consultationType: 'prenatal',
          gestationalAge: 20
        },
        startedAt: DateTime.now().minus({ days: 3 }),
        completedAt: DateTime.now().minus({ days: 3 })
      },
      {
        tenantId: 1,
        userId: 1, // Dr. Seck
        syncType: 'push',
        syncTrigger: 'manual',
        operation: 'update',
        entityType: 'consultation',
        entityId: 'uuid-consultation-004',
        syncSessionId: 'sync-doctor-002',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        hadConflict: false,
        conflictType: null,
        status: 'success',
        resolutionStrategy: null,
        errorMessage: null,
        clientData: { 
          action: 'create_emergency_consultation',
          patientId: 5,
          consultationType: 'emergency',
          urgency: 'immediate_transfer'
        },
        startedAt: DateTime.now().minus({ days: 1 }),
        completedAt: DateTime.now().minus({ days: 1 })
      },

      // Logs de sync pour Fatou Ba (sage-femme)
      {
        tenantId: 1,
        userId: 1, // Fatou Ba
        syncType: 'push',
        syncTrigger: 'manual',
        operation: 'update',
        entityType: 'vaccination',
        entityId: 'uuid-vaccination-001',
        syncSessionId: 'sync-midwife-001',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        hadConflict: false,
        conflictType: null,
        status: 'success',
        resolutionStrategy: null,
        errorMessage: null,
        clientData: { 
          action: 'record_vaccination',
          vaccineType: 'VAT',
          patientId: 5,
          doseNumber: 1
        },
        startedAt: DateTime.now().minus({ weeks: 8 }),
        completedAt: DateTime.now().minus({ weeks: 8 })
      },
      {
        tenantId: 1,
        userId: 1, // Fatou Ba
        syncType: 'push',
        syncTrigger: 'manual',
        operation: 'update',
        entityType: 'vaccine_schedule',
        entityId: 'uuid-vaccine-schedule-001',
        syncSessionId: 'sync-midwife-002',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        hadConflict: false,
        conflictType: null,
        status: 'success',
        resolutionStrategy: null,
        errorMessage: null,
        clientData: { 
          action: 'create_vaccination_schedule',
          patientId: 4,
          vaccineType: 'VAT',
          scheduledDate: DateTime.now().plus({ days: 7 }).toISO()
        },
        startedAt: DateTime.now().minus({ hours: 12 }),
        completedAt: DateTime.now().minus({ hours: 12 })
      },

      // Logs de sync multi-tenant (Tenant 2)
      {
        tenantId: 2,
        userId: 6, // Dr. Oumar Faye
        syncType: 'pull',
        syncTrigger: 'automatic',
        operation: 'update',
        entityType: 'vaccine_types',
        entityId: 'uuid-vaccine-types-001',
        syncSessionId: 'sync-almadies-001',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        hadConflict: false,
        conflictType: null,
        status: 'success',
        resolutionStrategy: null,
        errorMessage: null,
        clientData: { 
          action: 'fetch_available_vaccines',
          tenantId: 2,
          category: 'all'
        },
        startedAt: DateTime.now().minus({ days: 2 }),
        completedAt: DateTime.now().minus({ days: 2 })
      },

      // Logs d'erreur et de résolution de conflits
      {
        tenantId: 1,
        userId: 1, // Aïcha
        syncType: 'push',
        syncTrigger: 'manual',
        operation: 'update',
        entityType: 'appointment',
        entityId: 'uuid-appointment-001',
        syncSessionId: 'sync-aicha-004',
        clientVersion: 2,
        serverVersion: 3,
        status: 'conflict',
        resolutionStrategy: 'server_wins',
        errorMessage: null,
        clientData: { 
          action: 'reschedule_appointment',
          originalDate: DateTime.now().plus({ weeks: 4 }).toISO(),
          newDate: DateTime.now().plus({ weeks: 3 }).toISO(),
          reason: 'Conflit avec le planning médecin'
        },
        startedAt: DateTime.now().minus({ minutes: 15 }),
        completedAt: DateTime.now().minus({ minutes: 10 })
      },
      {
        tenantId: 1,
        userId: 1, // Dr. Seck
        syncType: 'pull',
        syncTrigger: 'automatic',
        operation: 'update',
        entityType: 'patient_list',
        entityId: 'uuid-patient-list-001',
        syncSessionId: 'sync-doctor-003',
        clientVersion: 1,
        serverVersion: 1,
        status: 'in_progress',
        resolutionStrategy: null,
        errorMessage: 'Some patient records could not be synchronized due to privacy settings',
        clientData: { 
          action: 'fetch_patient_assignments',
          doctorId: 2,
          syncedPatients: 2,
          failedPatients: 1
        },
        startedAt: DateTime.now().minus({ minutes: 45 }),
        completedAt: DateTime.now().minus({ minutes: 45 })
      },

      // Logs Demo tenant
      {
        tenantId: 4,
        userId: 12, // Patiente Demo
        syncType: 'pull',
        syncTrigger: 'automatic',
        operation: 'update',
        entityType: 'pregnancy',
        entityId: 'uuid-pregnancy-demo-001',
        syncSessionId: 'sync-demo-001',
        clientVersion: 1,
        serverVersion: 1,
        resolvedVersion: 1,
        hadConflict: false,
        conflictType: null,
        status: 'success',
        resolutionStrategy: null,
        errorMessage: null,
        clientData: { 
          action: 'demo_data_sync',
          demoMode: true
        },
        startedAt: DateTime.now().minus({ hours: 1 }),
        completedAt: DateTime.now().minus({ hours: 1 })
      }
    ])
  }
}