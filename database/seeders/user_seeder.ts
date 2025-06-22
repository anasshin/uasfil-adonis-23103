import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { create } from 'domain'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        fullName: 'Admin User',
        email: 'admin@movatix.com',
        password: 'password',
        role: 'admin',
      },
      {
        fullName: 'Regular User',
        email: 'user@movatix.com',
        password: 'password',
        role: 'user',
      },
    ])
  }
}
