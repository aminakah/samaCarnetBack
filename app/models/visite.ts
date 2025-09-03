import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tenant from './tenant.js'
import Patient from './patient.js'
import Personnel from './personnel.js'
import TypeVisite from './type_visite.js'

/**
 * Visite model for medical consultations and visits
 */
export default class Visite extends BaseModel {
  static table = 'visite'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tenantId: number

  @column()
  declare patientId: number

  @column()
  declare personnelId: number

  @column()
  declare typeVisiteId: number

  

  @column.dateTime()
  declare scheduledAt: DateTime | null

  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare endedAt: DateTime | null

  @column()
  declare durationMinutes: number | null

  @column()
  declare status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

  @column()
  declare chiefComplaint: string | null

  @column()
  declare historyPresentIllness: string | null

  @column()
  declare physicalExamination: string | null

  @column()
  declare diagnosis: string | null

  @column()
  declare treatmentPlan: string | null

  @column()
  declare prescriptions: string | null

  @column()
  declare recommendations: string | null

  @column()
  declare notes: string | null

  // Vital signs
  @column()
  declare weightKg: number | null

  @column()
  declare heightCm: number | null

  @column()
  declare bmi: number | null

  @column()
  declare systolicBp: number | null

  @column()
  declare diastolicBp: number | null

  @column()
  declare heartRate: number | null

  @column()
  declare temperatureC: number | null

  // Pregnancy-specific data
  @column()
  declare pregnancyWeek: number | null

  @column()
  declare fundalHeightCm: number | null

  @column()
  declare fetalHeartRate: number | null

  @column()
  declare fetalMovement: string | null

  // Billing and management
  @column()
  declare cost: number | null

  @column()
  declare isPaid: boolean

  @column.dateTime()
  declare paidAt: DateTime | null

  @column()
  declare supervisedBy: number | null

  @column()
  declare validatedBy: number | null

  @column.dateTime()
  declare validatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  @belongsTo(() => Personnel)
  declare personnel: BelongsTo<typeof Personnel>

  @belongsTo(() => TypeVisite)
  declare typeVisite: BelongsTo<typeof TypeVisite>


  @belongsTo(() => Personnel, {
    foreignKey: 'supervisedBy',
  })
  declare supervisor: BelongsTo<typeof Personnel>

  @belongsTo(() => Personnel, {
    foreignKey: 'validatedBy',
  })
  declare validator: BelongsTo<typeof Personnel>

  // Computed properties
  @computed()
  get isCompleted(): boolean {
    return this.status === 'completed'
  }

  @computed()
  get isInProgress(): boolean {
    return this.status === 'in_progress'
  }

  @computed()
  get actualDuration(): number | null {
    if (!this.startedAt || !this.endedAt) return null
    return this.endedAt.diff(this.startedAt, 'minutes').minutes
  }

  @computed()
  get bloodPressure(): string | null {
    if (!this.systolicBp || !this.diastolicBp) return null
    return `${this.systolicBp}/${this.diastolicBp}`
  }

  /**
   * Calculate BMI if height and weight are available
   */
  calculateBMI(): number | null {
    if (!this.weightKg || !this.heightCm) return null
    const heightM = this.heightCm / 100
    return Math.round((this.weightKg / (heightM * heightM)) * 100) / 100
  }

  /**
   * Start visit
   */
  async startVisit(): Promise<void> {
    if (this.status !== 'scheduled') {
      throw new Error('Can only start scheduled visits')
    }

    this.status = 'in_progress'
    this.startedAt = DateTime.now()
    await this.save()
  }

  /**
   * Complete visit
   */
  async completeVisit(data?: {
    diagnosis?: string
    treatmentPlan?: string
    prescriptions?: string
    recommendations?: string
    notes?: string
  }): Promise<void> {
    if (this.status !== 'in_progress') {
      throw new Error('Can only complete visits in progress')
    }

    this.status = 'completed'
    this.endedAt = DateTime.now()
    
    if (data) {
      Object.assign(this, data)
    }

    // Calculate duration
    if (this.startedAt) {
      this.durationMinutes = this.actualDuration
    }

    // Calculate BMI if data available
    if (this.weightKg && this.heightCm) {
      this.bmi = this.calculateBMI()
    }

    await this.save()
  }

  /**
   * Cancel visit
   */
  async cancelVisit(reason?: string): Promise<void> {
    if (!['scheduled', 'in_progress'].includes(this.status)) {
      throw new Error('Can only cancel scheduled or in-progress visits')
    }

    this.status = 'cancelled'
    if (reason && this.notes) {
      this.notes = `${this.notes}\n\nCancellation reason: ${reason}`
    } else if (reason) {
      this.notes = `Cancellation reason: ${reason}`
    }

    await this.save()
  }

  /**
   * Mark as no-show
   */
  async markNoShow(): Promise<void> {
    if (this.status !== 'scheduled') {
      throw new Error('Can only mark scheduled visits as no-show')
    }

    this.status = 'no_show'
    await this.save()
  }

  /**
   * Validate visit (supervisor approval)
   */
  async validateVisit(validatorId: number): Promise<void> {
    if (this.status !== 'completed') {
      throw new Error('Can only validate completed visits')
    }

    this.validatedBy = validatorId
    this.validatedAt = DateTime.now()
    await this.save()
  }

  /**
   * Record payment
   */
  async recordPayment(amount?: number): Promise<void> {
    this.isPaid = true
    this.paidAt = DateTime.now()
    if (amount) {
      this.cost = amount
    }
    await this.save()
  }

  /**
   * Find visits for patient
   */
  static async findForPatient(patientId: number, options: {
    limit?: number
    status?: string
    startDate?: DateTime
    endDate?: DateTime
  } = {}) {
    const { limit = 50, status, startDate, endDate } = options
    
    const query = this.query()
      .where('patient_id', patientId)
      .preload('personnel', (personnelQuery) => {
        personnelQuery.preload('user')
        personnelQuery.preload('typePersonnel')
      })
      .preload('typeVisite')
      .orderBy('scheduled_at', 'desc')
      .limit(limit)

    if (status) {
      query.where('status', status)
    }

    if (startDate) {
      query.where('scheduled_at', '>=', startDate.toSQL() || '')
    }

    if (endDate) {
      query.where('scheduled_at', '<=', endDate.toSQL() || '')
    }

    return await query
  }

  /**
   * Find visits for personnel
   */
  static async findForPersonnel(personnelId: number, date?: DateTime) {
    const query = this.query()
      .where('personnel_id', personnelId)
      .preload('patient')
      .preload('typeVisite')
      .orderBy('scheduled_at', 'asc')

    if (date) {
      query.whereBetween('scheduled_at', [
        date.startOf('day').toSQL() || '',
        date.endOf('day').toSQL() || ''
      ])
    } else {
      query.where('scheduled_at', '>=', DateTime.now().startOf('day').toSQL() || '')
    }

    return await query
  }

  /**
   * Find available slots for appointment
   */
  static async findAvailableSlots(
    personnelId: number,
    date: DateTime,
    durationMinutes: number = 30
  ) {
    const dayStart = date.startOf('day').set({ hour: 8 }) // 8 AM
    const dayEnd = date.startOf('day').set({ hour: 17 })  // 5 PM
    
    // Get existing appointments
    const existingVisits = await this.query()
      .where('personnel_id', personnelId)
      .whereBetween('scheduled_at', [dayStart.toSQL(), dayEnd.toSQL()])
      .where('status', 'scheduled')
      .orderBy('scheduled_at', 'asc')

    const slots = []
    let currentSlot = dayStart

    for (const visit of existingVisits) {
      // Add slots before this visit
      while (currentSlot.plus({ minutes: durationMinutes }) <= visit.scheduledAt!) {
        slots.push(currentSlot)
        currentSlot = currentSlot.plus({ minutes: 30 }) // 30-minute intervals
      }
      
      // Move past this visit
      currentSlot = visit.scheduledAt!.plus({ minutes: visit.durationMinutes || 30 })
    }

    // Add remaining slots until end of day
    while (currentSlot.plus({ minutes: durationMinutes }) <= dayEnd) {
      slots.push(currentSlot)
      currentSlot = currentSlot.plus({ minutes: 30 })
    }

    return slots
  }

  /**
   * Get visit statistics for tenant
   */
  static async getStatistics(tenantId: number, startDate: DateTime, endDate: DateTime) {
    const baseQuery = this.query()
      .where('tenant_id', tenantId)
      .whereBetween('scheduled_at', [startDate.toSQL() || '', endDate.toSQL() || ''])

    const [
      totalVisits,
      completedVisits,
      cancelledVisits,
      noShowVisits,
      totalRevenue
    ] = await Promise.all([
      baseQuery.clone().count('* as total'),
      baseQuery.clone().where('status', 'completed').count('* as total'),
      baseQuery.clone().where('status', 'cancelled').count('* as total'),
      baseQuery.clone().where('status', 'no_show').count('* as total'),
      baseQuery.clone().where('is_paid', true).sum('cost as total')
    ])

    return {
      totalVisits: Number(totalVisits[0].$extras.total),
      completedVisits: Number(completedVisits[0].$extras.total),
      cancelledVisits: Number(cancelledVisits[0].$extras.total),
      noShowVisits: Number(noShowVisits[0].$extras.total),
      totalRevenue: Number(totalRevenue[0].$extras.total) || 0
    }
  }

  /**
   * Soft delete visit
   */
  async softDelete(): Promise<void> {
    this.deletedAt = DateTime.now()
    await this.save()
  }
}