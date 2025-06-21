import Studio from '#models/studio'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Studio.createMany([
      { nama_studio: 'Studio 1', kapasitas: 20 },
      { nama_studio: 'Studio 2', kapasitas: 30 },
      { nama_studio: 'Studio 3', kapasitas: 40 },
      { nama_studio: 'Studio VIP', kapasitas: 10 },
      { nama_studio: 'Studio 4D', kapasitas: 50 },
    ])
  }
}
