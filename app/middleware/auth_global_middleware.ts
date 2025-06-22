import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthGlobalMiddleware {
  async handle({ auth, view }: HttpContext, next: NextFn) {
    try {
      // Pastikan auth sudah diinisialisasi
      if (!auth) {
        console.log('Auth not available')
        view.share({
          auth: {
            user: null,
            isAuthenticated: false,
          },
        })
        return await next()
      }

      // Cek status auth dengan try-catch
      let isAuthenticated = false
      let user = null

      try {
        isAuthenticated = await auth.check()
        user = isAuthenticated ? auth.user : null
      } catch (authError) {
        console.log('Auth check failed:', authError)
        isAuthenticated = false
        user = null
      }

      // Debug log
      console.log('Auth Global Middleware:', {
        isAuthenticated,
        user: user ? user.fullName : null,
      })

      // Share auth data ke semua views
      view.share({
        auth: {
          user: user,
          isAuthenticated: isAuthenticated,
        },
      })
    } catch (error) {
      console.error('Auth Global Middleware Error:', error)
      // Jika error, set default values
      view.share({
        auth: {
          user: null,
          isAuthenticated: false,
        },
      })
    }

    return await next()
  }
}
