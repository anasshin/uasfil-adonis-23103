import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  // Tampilkan halaman login
  async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  // Tampilkan halaman register
  async showRegister({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  // Proses login
  async login({ request, response, session, auth }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      // Validasi input
      if (!email || !password) {
        session.flash('error', 'Email dan password harus diisi!')
        return response.redirect('/login')
      }

      //   // Cari user berdasarkan email
      //   const user = await User.findBy('email', email)
      //   if (!user) {
      //     session.flash('error', 'Email atau password salah!')
      //     return response.redirect('/login')
      //   }

      // Verifikasi password
      // const isPasswordValid = await hash.verify(user.password, password)
      // if (!isPasswordValid) {
      //   session.flash('error', 'Email atau password salah!')
      //   return response.redirect('/login')
      // }

      // Gunakan User.verifyCredentials (lebih aman dan standar AdonisJS)
      const user = await User.verifyCredentials(email, password)
      if (!user) {
        session.flash('error', 'Email atau password salah!')
        return response.redirect('/login')
      }

      // Login user
      await auth.use('web').login(user)

      // // Simpan user info di session untuk navbar
      // session.put('user', {
      //   id: user.id,
      //   fullName: user.fullName,
      //   email: user.email,
      // })

      session.flash('message', 'Login berhasil! Selamat datang kembali.')
      return response.redirect('/')
    } catch (error) {
      console.error('Login error:', error)
      session.flash('error', 'Terjadi kesalahan saat login!')
      console.log(error)
      return response.redirect('/login')
    }
  }

  // Proses register
  async register({ request, response, session }: HttpContext) {
    try {
      const { fullName, email, password, confirmPassword } = request.only([
        'fullName',
        'email',
        'password',
        'confirmPassword',
      ])

      // Validasi input
      if (!fullName || !email || !password || !confirmPassword) {
        session.flash('error', 'Semua field harus diisi!')
        return response.redirect('/register')
      }

      if (password !== confirmPassword) {
        session.flash('error', 'Konfirmasi password tidak cocok!')
        return response.redirect('/register')
      }

      if (password.length < 6) {
        session.flash('error', 'Password minimal 6 karakter!')
        return response.redirect('/register')
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        session.flash('error', 'Email sudah terdaftar!')
        return response.redirect('/register')
      }

      // Buat user baru
      const user = await User.create({
        fullName,
        email,
        password: await hash.make(password),
      })

      session.flash('message', 'Registrasi berhasil! Silakan login dengan akun Anda.')
      return response.redirect('/login')
    } catch (error) {
      console.error('Register error:', error)
      session.flash('error', 'Terjadi kesalahan saat registrasi!')
      return response.redirect('/register')
    }
  }

  // Logout
  async logout({ response, session, auth }: HttpContext) {
    await auth.use('web').logout()
    session.flash('message', 'Logout berhasil!')
    return response.redirect('/login')
  }
}
