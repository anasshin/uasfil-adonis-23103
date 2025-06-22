import edge from 'edge.js'

/**
 * Global untuk auth - akan tersedia di semua template
 */
edge.global('getAuth', (ctx) => {
  return {
    user: ctx.auth?.user || null,
    isAuthenticated: ctx.auth?.user ? true : false,
  }
})
