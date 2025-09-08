import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'

export default class PatientQr extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare patientId: number

  @column()
  declare qrCode: string // UUID unique global

  @column()
  declare qrCodeImage: string // Base64 de l'image QR

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare lastScannedAt: DateTime | null

  @column()
  declare scanCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  /**
   * Generate new QR code for patient
   */
  static async generateForPatient(patientId: number): Promise<PatientQr> {
    const qrCode = uuidv4()
    
    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCode, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return await this.create({
      patientId,
      qrCode,
      qrCodeImage,
      isActive: true,
      scanCount: 0
    })
  }

  /**
   * Find patient by QR code (cross-tenant)
   */
  static async findPatientByQrCode(qrCode: string): Promise<Patient | null> {
    const patientQr = await this.query()
      .where('qr_code', qrCode)
      .where('is_active', true)
      .preload('patient', (query) => {
        query.preload('tenant')
        query.preload('pregnancies', (pregQuery) => {
          pregQuery.where('is_active', true)
        })
      })
      .first()

    if (!patientQr) return null

    // Update scan statistics
    patientQr.lastScannedAt = DateTime.now()
    patientQr.scanCount += 1
    await patientQr.save()

    return patientQr.patient
  }

  /**
   * Regenerate QR code
   */
  async regenerate(): Promise<void> {
    this.qrCode = uuidv4()
    this.qrCodeImage = await QRCode.toDataURL(this.qrCode, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1
    })
    await this.save()
  }

  /**
   * Deactivate QR code
   */
  async deactivate(): Promise<void> {
    this.isActive = false
    await this.save()
  }
}