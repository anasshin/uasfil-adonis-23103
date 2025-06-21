import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Genre from '#models/genre'

export default class extends BaseSeeder {
  async run() {
    await Genre.createMany([
      { nama_genre: 'Action' },
      { nama_genre: 'Comedy' },
      { nama_genre: 'Drama' },
      { nama_genre: 'Horror' },
      { nama_genre: 'Romance' },
      { nama_genre: 'Sci-Fi' },
    ])
  }
}
