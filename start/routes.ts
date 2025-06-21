const FilmsController = () => import('#controllers/films_controller')
import JadwalTayangsController from '#controllers/jadwal_tayangs_controller'
import TiketsController from '#controllers/tikets_controller'
import router from '@adonisjs/core/services/router'

// route film
router.get('/film', [FilmsController, 'index'])
router.post('/film', [FilmsController, 'store'])
router.post('/film/:id/update', [FilmsController, 'update'])
router.post('/film/:id/delete', [FilmsController, 'destroy'])

router.get('/jadwal', [JadwalTayangsController, 'index'])
router.post('/jadwal', [JadwalTayangsController, 'store'])
router.post('/jadwal/:id/update', [JadwalTayangsController, 'update'])
router.post('/jadwal/:id/delete', [JadwalTayangsController, 'destroy'])

router.get('/tiket', [TiketsController, 'index'])
router.post('/tiket/create', [TiketsController, 'createTickets'])
router.post('/tiket/:jadwal_id/buy', [TiketsController, 'buyTicket'])
router.post('/tiket/:id/status', [TiketsController, 'updateTicketStatus'])
