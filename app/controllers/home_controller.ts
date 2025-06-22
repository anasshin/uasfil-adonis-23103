import type { HttpContext } from '@adonisjs/core/http'
import Tiket from '#models/tiket'
import JadwalTayang from '#models/jadwal_tayang'
import Genre from '#models/genre'

export default class HomeController {
  async index({ request, view, session, auth }: HttpContext) {
    const search = request.input('search', '')
    const genreFilter = request.input('genre_filter', '')
    const tanggalFilter = request.input('tanggal_filter', '')
    const statusFilter = request.input('status_filter', '')

    // Query jadwal tayang yang masih aktif dan ada tiket tersedia
    const jadwalQuery = JadwalTayang.query()
      .preload('film', (filmQuery) => filmQuery.preload('genre'))
      .preload('studio')
      .where('tanggal', '>=', new Date().toISOString().slice(0, 10))
      .orderBy('tanggal', 'asc')
      .orderBy('jam', 'asc')

    // Filter search
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

    // Filter genre
    if (genreFilter) {
      jadwalQuery.whereHas('film', (q) => {
        q.where('genre_id', genreFilter)
      })
    }

    // Filter tanggal
    if (tanggalFilter) {
      jadwalQuery.where('tanggal', tanggalFilter)
    }

    let jadwals = await jadwalQuery.exec()

    // Tambahkan info tiket untuk setiap jadwal
    const jadwalsWithTickets = await Promise.all(
      jadwals.map(async (jadwal) => {
        const tickets = await Tiket.query().where('jadwal_tayang_id', jadwal.id)
        const tersedia = tickets.filter((t) => t.status === 'tersedia').length
        const terjual = tickets.filter((t) => t.status === 'terjual').length
        const reserved = tickets.filter((t) => t.status === 'reserved').length
        const harga = tickets.length > 0 ? tickets[0].harga : 50000

        let statusLabel = 'Belum Ada Tiket'
        let statusClass = 'bg-gray-500 text-white'
        let buttonDisabled = true

        if (tickets.length === 0) {
          statusLabel = 'Belum Ada Tiket'
          statusClass = 'bg-gray-500 text-white'
          buttonDisabled = true
        } else if (tersedia === 0) {
          statusLabel = 'Sold Out'
          statusClass = 'bg-red-600 text-white'
          buttonDisabled = true
        } else if (tersedia <= 5) {
          statusLabel = 'Hampir Habis'
          statusClass = 'bg-orange-600 text-white'
          buttonDisabled = false
        } else if (tersedia <= 10) {
          statusLabel = 'Terbatas'
          statusClass = 'bg-yellow-600 text-white'
          buttonDisabled = false
        } else {
          statusLabel = 'Tersedia'
          statusClass = 'bg-green-600 text-white'
          buttonDisabled = false
        }

        // Format tanggal
        const formatTanggal = (dateString: string) => {
          const date = new Date(dateString)
          const day = date.getDate().toString().padStart(2, '0')
          const month = (date.getMonth() + 1).toString().padStart(2, '0')
          const year = date.getFullYear()
          return `${day}/${month}/${year}`
        }

        // Format jam
        const formatJam = (timeString: string) => {
          return timeString.substring(0, 5) // HH:MM
        }

        return {
          id: jadwal.id,
          tanggal: formatTanggal(jadwal.tanggal),
          jam: formatJam(jadwal.jam),
          tersedia,
          terjual,
          reserved,
          totalTiket: tickets.length,
          harga,
          statusLabel,
          statusClass,
          buttonDisabled,
          film: {
            id: jadwal.film.id,
            judul: jadwal.film.judul,
            sutradara: jadwal.film.sutradara,
            tahun: jadwal.film.tahun,
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
          default:
            return true
        }
      })
    }

    // Pagination
    const page = Number.parseInt(request.input('page', '1'))
    const perPage = 12
    const total = filteredJadwals.length
    const pagedJadwals = filteredJadwals.slice((page - 1) * perPage, page * perPage)
    const lastPage = Math.ceil(total / perPage)

    // Genres untuk filter
    const genres = await Genre.all()

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

    return view.render('pages/home', {
      jadwals: jadwalData,
      genres: genres || [],
      search: search,
      genre_filter: genreFilter,
      tanggal_filter: tanggalFilter,
      status_filter: statusFilter,
      flashMessages: session.flashMessages || {},
      auth: {
        user: auth.user
          ? {
              id: auth.user.id,
              fullName: auth.user.fullName,
              email: auth.user.email,
            }
          : null,
      },
      session,
    })
  }

  // Method untuk beli tiket
  async buyTicket({ params, response, session, auth }: HttpContext) {
    try {
      // Cek apakah user sudah login (optional - tergantung requirement)
      // if (!auth.user) {
      //   session.flash('error', 'Silakan login terlebih dahulu untuk membeli tiket!')
      //   return response.redirect('/login')
      // }

      const jadwalId = params.jadwal_id

      // Cari tiket yang tersedia
      const tiket = await Tiket.query()
        .where('jadwal_tayang_id', jadwalId)
        .where('status', 'tersedia')
        .first()

      if (!tiket) {
        session.flash('error', 'Tiket sudah habis untuk jadwal ini!')
        return response.redirect('/')
      }

      // Update status tiket jadi terjual
      tiket.status = 'terjual'
      await tiket.save()

      session.flash('message', 'Tiket berhasil dibeli! Terima kasih.')
      return response.redirect('/')
    } catch (error) {
      console.error('Error buying ticket:', error)
      session.flash('error', 'Terjadi kesalahan saat membeli tiket!')
      return response.redirect('/')
    }
  }

  // Method untuk clear filters
  async clearFilters({ response }: HttpContext) {
    return response.redirect('/')
  }
}
