import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Film from './film.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Studio from './studio.js'
import Tiket from './tiket.js'

export default class JadwalTayang extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare film_id: number

  @column()
  declare studio_id: number

  @column()
  declare tanggal: DateTime

  @column()
  declare jam: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Film, {
    foreignKey: 'film_id',
  })
  declare film: BelongsTo<typeof Film>

  @belongsTo(() => Studio, {
    foreignKey: 'studio_id',
  })
  declare studio: BelongsTo<typeof Studio>

  @hasMany(() => Tiket, {
    foreignKey: 'jadwal_tayang_id', // Sesuaikan dengan nama kolom di tabel tiket
  })
  declare tikets: HasMany<typeof Tiket>
}
