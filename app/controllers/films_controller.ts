import type { HttpContext } from '@adonisjs/core/http'
import Film from '#models/film'
import Genre from '#models/genre'

export default class FilmsController {
  async index({ request, view }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const query = Film.query().preload('genre')

    if (search) {
      query.where((builder) => {
        builder.where('judul', 'like', `%${search}%`).orWhere('sutradara', 'like', `%${search}%`)
      })
    }

    const films = await query.paginate(page, 10)
    const genres = await Genre.all()

    return view.render('pages/film', { films, genres, search })
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const data = request.only(['judul', 'sutradara', 'tahun', 'genre_id'])

      await Film.create(data)

      session.flash('message', 'Film berhasil ditambahkan!')
      return response.redirect('/film')
    } catch (error) {
      session.flash('error', 'Gagal menambahkan film!')
      return response.redirect('/film')
    }
  }

  async update({ params, request, response, session }: HttpContext) {
    try {
      const film = await Film.findOrFail(params.id)
      const data = request.only(['judul', 'sutradara', 'tahun', 'genre_id'])

      film.merge(data)
      await film.save()

      session.flash('message', 'Film berhasil diperbarui!')
      return response.redirect('/film')
    } catch (error) {
      console.log(error)
      session.flash('error', 'Gagal memperbarui film!')
      return response.redirect('/film')
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      const film = await Film.findOrFail(params.id)
      await film.delete()
      session.flash('message', 'Film berhasil dihapus!')
      return response.status(200).send({ success: true })
    } catch (error) {
      session.flash('error', 'Gagal menghapus film!')
      return response.redirect('/film')
    }
  }
}
