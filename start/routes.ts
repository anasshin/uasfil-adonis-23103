const FilmsController = () => import('#controllers/films_controller')
import AuthController from '#controllers/auth_controller'
import HomeController from '#controllers/home_controller'
import JadwalTayangsController from '#controllers/jadwal_tayangs_controller'
import TiketsController from '#controllers/tikets_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Auth routes
router.get('/login', [AuthController, 'showLogin']).as('auth.login.show')
router.post('/login', [AuthController, 'login']).as('auth.login')
router.get('/register', [AuthController, 'showRegister']).as('auth.register.show')
router.post('/register', [AuthController, 'register']).as('auth.register')
router.post('/logout', [AuthController, 'logout']).as('auth.logout')

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
router.post('/tiket/create', [TiketsController, 'create'])
router.post('/tiket/:jadwal_id/buy', [TiketsController, 'buyTicket'])
router.post('/tiket/:id/status', [TiketsController, 'updateTicketStatus'])

router.get('/', [HomeController, 'index'])
router.post('/buy-ticket/:jadwal_id', [HomeController, 'buyTicket'])
router.get('/clear-filters', [HomeController, 'clearFilters'])
