import type { HttpContext } from '@adonisjs/core/http'
import JadwalTayang from '#models/jadwal_tayang'
import Film from '#models/film'
import Studio from '#models/studio'

export default class JadwalTayangsController {
  // Tampilkan tabel jadwal tayang
  async index({ request, view }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const query = JadwalTayang.query()
      .preload('film', (filmQuery) => filmQuery.preload('genre'))
      .preload('studio')
      .orderBy('tanggal', 'desc')
      .orderBy('jam', 'desc')

    if (search) {
      query.where((builder) => {
        builder
          .whereHas('film', (q) => {
            q.whereILike('judul', `%${search}%`).orWhereILike('sutradara', `%${search}%`)
          })
          .orWhereHas('studio', (q) => {
            q.whereILike('nama_studio', `%${search}%`)
          })
      })
    }

    const jadwals = await query.paginate(page, 10)
    const films = await Film.query().preload('genre')
    const studios = await Studio.all()

    return view.render('pages/jadwal_tayang', {
      jadwals,
      films,
      studios,
      search,
    })
  }

  // Simpan jadwal baru
  async store({ request, response, session }: HttpContext) {
    const data = request.only(['film_id', 'studio_id', 'tanggal', 'jam'])

    // Validasi sederhana
    if (!data.film_id || !data.studio_id || !data.tanggal || !data.jam) {
      session.flash('error', 'Semua field wajib diisi')
      return response.redirect('/jadwal')
    }

    // Cek konflik studio
    const studioConflict = await JadwalTayang.query()
      .where('studio_id', data.studio_id)
      .where('tanggal', data.tanggal)
      .where('jam', data.jam)
      .first()

    if (studioConflict) {
      session.flash('error', 'Studio sudah memiliki jadwal pada tanggal dan jam tersebut.')
      return response.redirect('/jadwal')
    }

    // Cek konflik film di waktu sama di studio lain
    const filmConflict = await JadwalTayang.query()
      .where('film_id', data.film_id)
      .where('tanggal', data.tanggal)
      .where('jam', data.jam)
      .first()

    if (filmConflict) {
      session.flash('error', 'Film ini sudah dijadwalkan pada waktu yang sama di studio lain.')
      return response.redirect('/jadwal')
    }

    await JadwalTayang.create(data)
    session.flash('message', 'Jadwal tayang berhasil ditambahkan!')
    return response.redirect('/jadwal')
  }

  // Update jadwal
  async update({ params, request, response, session }: HttpContext) {
    const jadwal = await JadwalTayang.findOrFail(params.id)
    const data = request.only(['film_id', 'studio_id', 'tanggal', 'jam'])

    // Cek konflik studio (kecuali diri sendiri)
    const studioConflict = await JadwalTayang.query()
      .where('studio_id', data.studio_id)
      .where('tanggal', data.tanggal)
      .where('jam', data.jam)
      .whereNot('id', jadwal.id)
      .first()

    if (studioConflict) {
      session.flash('error', 'Studio sudah memiliki jadwal pada tanggal dan jam tersebut.')
      return response.redirect('/jadwal')
    }

    // Cek konflik film di waktu sama di studio lain (kecuali diri sendiri)
    const filmConflict = await JadwalTayang.query()
      .where('film_id', data.film_id)
      .where('tanggal', data.tanggal)
      .where('jam', data.jam)
      .whereNot('id', jadwal.id)
      .first()

    if (filmConflict) {
      session.flash('error', 'Film ini sudah dijadwalkan pada waktu yang sama di studio lain.')
      return response.redirect('/jadwal')
    }

    jadwal.merge(data)
    await jadwal.save()
    session.flash('message', 'Jadwal tayang berhasil diperbarui!')
    return response.redirect('/jadwal')
  }

  // Hapus jadwal
  async destroy({ params, response, session }: HttpContext) {
    const jadwal = await JadwalTayang.findOrFail(params.id)
    await jadwal.delete()
    session.flash('message', 'Jadwal tayang berhasil dihapus!')
    return response.status(200).send({ success: true })
  }
}
