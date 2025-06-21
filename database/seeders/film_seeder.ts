import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Film from '#models/film'
import Genre from '#models/genre'

export default class extends BaseSeeder {
  async run() {
    // Ambil semua genre yang ada
    const genres = await Genre.all()

    if (genres.length === 0) {
      console.log('Tidak ada genre ditemukan. Jalankan genre seeder terlebih dahulu.')
      return
    }

    await Film.createMany([
      {
        judul: 'Avengers: Endgame',
        sutradara: 'Anthony Russo, Joe Russo',
        tahun: 2019,
        genre_id: genres.find((g) => g.nama_genre === 'Action')?.id || 1,
      },
      {
        judul: 'The Dark Knight',
        sutradara: 'Christopher Nolan',
        tahun: 2008,
        genre_id: genres.find((g) => g.nama_genre === 'Action')?.id || 1,
      },
      {
        judul: 'Parasite',
        sutradara: 'Bong Joon-ho',
        tahun: 2019,
        genre_id: genres.find((g) => g.nama_genre === 'Drama')?.id || 3,
      },
      {
        judul: 'Interstellar',
        sutradara: 'Christopher Nolan',
        tahun: 2014,
        genre_id: genres.find((g) => g.nama_genre === 'Sci-Fi')?.id || 6,
      },
      {
        judul: 'The Grand Budapest Hotel',
        sutradara: 'Wes Anderson',
        tahun: 2014,
        genre_id: genres.find((g) => g.nama_genre === 'Comedy')?.id || 2,
      },
      {
        judul: 'A Quiet Place',
        sutradara: 'John Krasinski',
        tahun: 2018,
        genre_id: genres.find((g) => g.nama_genre === 'Horror')?.id || 4,
      },
      {
        judul: 'La La Land',
        sutradara: 'Damien Chazelle',
        tahun: 2016,
        genre_id: genres.find((g) => g.nama_genre === 'Romance')?.id || 5,
      },
      {
        judul: 'Blade Runner 2049',
        sutradara: 'Denis Villeneuve',
        tahun: 2017,
        genre_id: genres.find((g) => g.nama_genre === 'Sci-Fi')?.id || 6,
      },
      {
        judul: 'Joker',
        sutradara: 'Todd Phillips',
        tahun: 2019,
        genre_id: genres.find((g) => g.nama_genre === 'Drama')?.id || 3,
      },
      {
        judul: 'Mad Max: Fury Road',
        sutradara: 'George Miller',
        tahun: 2015,
        genre_id: genres.find((g) => g.nama_genre === 'Action')?.id || 1,
      },
      {
        judul: 'The Shape of Water',
        sutradara: 'Guillermo del Toro',
        tahun: 2017,
        genre_id: genres.find((g) => g.nama_genre === 'Romance')?.id || 5,
      },
      {
        judul: 'Get Out',
        sutradara: 'Jordan Peele',
        tahun: 2017,
        genre_id: genres.find((g) => g.nama_genre === 'Horror')?.id || 4,
      },
      {
        judul: 'Spider-Man: Into the Spider-Verse',
        sutradara: 'Bob Persichetti, Peter Ramsey, Rodney Rothman',
        tahun: 2018,
        genre_id: genres.find((g) => g.nama_genre === 'Action')?.id || 1,
      },
      {
        judul: 'Knives Out',
        sutradara: 'Rian Johnson',
        tahun: 2019,
        genre_id: genres.find((g) => g.nama_genre === 'Comedy')?.id || 2,
      },
      {
        judul: 'Dune',
        sutradara: 'Denis Villeneuve',
        tahun: 2021,
        genre_id: genres.find((g) => g.nama_genre === 'Sci-Fi')?.id || 6,
      },
    ])

    console.log('Film seeder berhasil dijalankan!')
  }
}
