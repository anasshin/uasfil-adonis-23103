import type { HttpContext } from '@adonisjs/core/http'
import Tiket from '#models/tiket'
import JadwalTayang from '#models/jadwal_tayang'
import Genre from '#models/genre'

export default class TiketsController {
  async index({ request, view, session }: HttpContext) {
    const search = request.input('search', '')
    const genreFilter = request.input('genre_filter', '')
    const tanggalFilter = request.input('tanggal_filter', '')
    const statusFilter = request.input('status_filter', '')

    // Query jadwal tayang
    const jadwalQuery = JadwalTayang.query()
      .preload('film', (filmQuery) => filmQuery.preload('genre'))
      .preload('studio')
      .where('tanggal', '>=', new Date().toISOString().slice(0, 10))
      .orderBy('tanggal', 'asc')
      .orderBy('jam', 'asc')

    if (search) {
      jadwalQuery.where((builder) => {
        builder
          .whereHas('film', (q) => {
            q.whereILike('judul', `%${search}%`).orWhereILike('sutradara', `%${search}%`)
          })
          .orWhereHas('studio', (q) => {
            q.whereILike('nama_studio', `%${search}%`)
          })
      })
    }
    if (genreFilter) {
      jadwalQuery.whereHas('film', (q) => {
        q.where('genre_id', genreFilter)
      })
    }
    if (tanggalFilter) {
      jadwalQuery.where('tanggal', tanggalFilter)
    }

    let jadwals = await jadwalQuery.exec()

    // Tambahkan info tiket untuk setiap jadwal (TANPA AUTO-GENERATE)
    const jadwalsWithTickets = await Promise.all(
      jadwals.map(async (jadwal, index) => {
        // Hanya ambil tiket yang sudah ada, jangan auto-generate
        const tickets = await Tiket.query().where('jadwal_tayang_id', jadwal.id)
        const tersedia = tickets.filter((t) => t.status === 'tersedia').length
        const terjual = tickets.filter((t) => t.status === 'terjual').length
        const reserved = tickets.filter((t) => t.status === 'reserved').length
        const harga = tickets.length > 0 ? tickets[0].harga : 0

        let statusLabel = 'Belum Ada Tiket'
        let statusClass = 'badge-neutral'
        let progressColor = 'progress-neutral'

        if (tickets.length === 0) {
          statusLabel = 'Belum Ada Tiket'
          statusClass = 'badge-neutral'
          progressColor = 'progress-neutral'
        } else if (tersedia === 0) {
          statusLabel = 'Sold Out'
          statusClass = 'badge-error'
          progressColor = 'progress-error'
        } else if (tersedia <= 5) {
          statusLabel = 'Hampir Habis'
          statusClass = 'badge-warning'
          progressColor = 'progress-warning'
        } else if (tersedia <= 10) {
          statusLabel = 'Terbatas'
          statusClass = 'badge-info'
          progressColor = 'progress-info'
        } else {
          statusLabel = 'Tersedia'
          statusClass = 'badge-success'
          progressColor = 'progress-success'
        }

        const progress = tickets.length > 0 ? ((terjual + reserved) / tickets.length) * 100 : 0
        // Format tanggal menjadi dd/mm/yyyy
        const formatTanggal = (dateString: string) => {
          const date = new Date(dateString)
          const day = date.getDate().toString().padStart(2, '0')
          const month = (date.getMonth() + 1).toString().padStart(2, '0')
          const year = date.getFullYear()
          return `${day}/${month}/${year}`
        }
        return {
          id: jadwal.id,
          tanggal: formatTanggal(jadwal.tanggal),
          jam: jadwal.jam,
          nomor: index + 1,
          tersedia,
          terjual,
          reserved,
          harga,
          totalTiket: tickets.length,
          statusLabel,
          statusClass,
          progressColor,
          progress: Math.round(progress),
          film: {
            id: jadwal.film.id,
            judul: jadwal.film.judul,
            sutradara: jadwal.film.sutradara,
            tahun: jadwal.film.tahun,
            genre_id: jadwal.film.genre_id,
            genre: {
              id: jadwal.film.genre.id,
              nama_genre: jadwal.film.genre.nama_genre,
            },
          },
          studio: {
            id: jadwal.studio.id,
            nama_studio: jadwal.studio.nama_studio,
            kapasitas: jadwal.studio.kapasitas,
          },
        }
      })
    )

    // Filter berdasarkan status
    let filteredJadwals = jadwalsWithTickets
    if (statusFilter) {
      filteredJadwals = jadwalsWithTickets.filter((jadwal) => {
        switch (statusFilter) {
          case 'tersedia':
            return jadwal.tersedia > 10
          case 'terbatas':
            return jadwal.tersedia > 0 && jadwal.tersedia <= 10
          case 'hampir_habis':
            return jadwal.tersedia > 0 && jadwal.tersedia <= 5
          case 'sold_out':
            return jadwal.tersedia === 0 && jadwal.totalTiket > 0
          case 'ada_reserved':
            return jadwal.reserved > 0
          case 'belum_ada_tiket':
            return jadwal.totalTiket === 0
          default:
            return true
        }
      })
    }

    // Pagination manual
    const page = Number.parseInt(request.input('page', '1'))
    const perPage = 12
    const total = filteredJadwals.length
    const pagedJadwals = filteredJadwals.slice((page - 1) * perPage, page * perPage)
    const lastPage = Math.ceil(total / perPage)

    // Genres
    const genres = await Genre.all()

    // Statistik
    const totalTiket = await Tiket.query().count('* as total')
    const tiketTerjual = await Tiket.query().where('status', 'terjual').count('* as total')
    const pendapatan = await Tiket.query().where('status', 'terjual').sum('harga as total')

    // Hitung jadwal yang belum ada tiket
    const totalJadwal = await JadwalTayang.query()
      .where('tanggal', '>=', new Date().toISOString().slice(0, 10))
      .count('* as total')

    const jadwalDenganTiket = await JadwalTayang.query()
      .whereHas('tikets') // Menggunakan relasi tikets
      .where('tanggal', '>=', new Date().toISOString().slice(0, 10))
      .count('* as total')

    const movieBelumAdaTiket = totalJadwal[0].$extras.total - jadwalDenganTiket[0].$extras.total

    const stats = {
      total_tiket: totalTiket[0].$extras.total || 0,
      tiket_terjual: tiketTerjual[0].$extras.total || 0,
      movie_belum_ada_tiket: movieBelumAdaTiket || 0,
      total_pendapatan: pendapatan[0].$extras.total || 0,
    }

    // Available jadwals untuk modal (yang belum punya tiket)
    const availableJadwals = await JadwalTayang.query()
      .preload('film')
      .preload('studio')
      .where('tanggal', '>=', new Date().toISOString().slice(0, 10))
      .orderBy('tanggal', 'asc')

    const jadwalData = {
      data: pagedJadwals,
      currentPage: page,
      perPage,
      lastPage,
      total,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
      nextPage: page < lastPage ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    }

    return view.render('pages/tiket', {
      jadwals: jadwalData,
      genres: genres || [],
      stats,
      availableJadwals: availableJadwals || [],
      search: search || '',
      genre_filter: genreFilter || '',
      tanggal_filter: tanggalFilter || '',
      status_filter: statusFilter || '',
      flashMessages: session.flashMessages || {},
    })
  }

  // Method untuk membuat tiket manual
  async create({ request, response, session }: HttpContext) {
    try {
      const { jadwal_tayang_id, harga } = request.only(['jadwal_tayang_id', 'harga'])

      // Validasi input
      if (!jadwal_tayang_id || !harga) {
        session.flash('error', 'Jadwal dan harga tiket harus diisi!')
        return response.redirect('/tiket')
      }

      // Cek jadwal ada atau tidak
      const jadwal = await JadwalTayang.findOrFail(jadwal_tayang_id)
      await jadwal.load('studio')

      // Cek apakah sudah ada tiket untuk jadwal ini
      const existingTickets = await Tiket.query().where('jadwal_tayang_id', jadwal_tayang_id)
      if (existingTickets.length > 0) {
        session.flash('error', 'Tiket untuk jadwal ini sudah dibuat sebelumnya!')
        return response.redirect('/tiket')
      }

      // Buat tiket sejumlah kapasitas studio
      const ticketsToCreate = []
      for (let i = 0; i < jadwal.studio.kapasitas; i++) {
        ticketsToCreate.push({
          jadwal_tayang_id: Number.parseInt(jadwal_tayang_id),
          harga: Number.parseInt(harga),
          status: 'tersedia',
        })
      }

      await Tiket.createMany(ticketsToCreate)

      session.flash(
        'message',
        `Berhasil membuat ${jadwal.studio.kapasitas} tiket untuk jadwal ini!`
      )
      return response.redirect('/tiket')
    } catch (error) {
      console.error('Error creating tickets:', error)
      session.flash('error', 'Terjadi kesalahan saat membuat tiket!')
      return response.redirect('/tiket')
    }
  }

  // Method untuk beli tiket
  async buyTicket({ params, response, session }: HttpContext) {
    try {
      const jadwalId = params.jadwal_id

      // Cari tiket yang tersedia
      const tiket = await Tiket.query()
        .where('jadwal_tayang_id', jadwalId)
        .where('status', 'tersedia')
        .first()

      if (!tiket) {
        session.flash('error', 'Tiket sudah habis untuk jadwal ini!')
        return response.redirect('/tiket')
      }

      // Update status tiket jadi terjual
      tiket.status = 'terjual'
      await tiket.save()

      session.flash('message', 'Tiket berhasil dibeli!')
      return response.redirect('/tiket')
    } catch (error) {
      console.error('Error buying ticket:', error)
      session.flash('error', 'Terjadi kesalahan saat membeli tiket!')
      return response.redirect('/tiket')
    }
  }

  // Method untuk update status tiket
  async updateTicketStatus({ params, request, response, session }: HttpContext) {
    try {
      const tiketId = params.id
      const { status } = request.only(['status'])

      const tiket = await Tiket.findOrFail(tiketId)
      tiket.status = status
      await tiket.save()

      return response.json({ success: true, message: 'Status tiket berhasil diupdate!' })
    } catch (error) {
      return response
        .status(500)
        .json({ success: false, message: 'Gagal mengupdate status tiket!' })
    }
  }
}
