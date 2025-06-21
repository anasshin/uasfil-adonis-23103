import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import JadwalTayang from './jadwal_tayang.js'

export default class Tiket extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jadwal_tayang_id: number

  @column()
  declare harga: number

  @column()
  declare status: 'tersedia' | 'reserved' | 'terjual'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => JadwalTayang, {
    foreignKey: 'jadwal_tayang_id',
  })
  declare jadwalTayang: BelongsTo<typeof JadwalTayang>
}
