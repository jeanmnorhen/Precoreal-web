import { NextRequest, NextResponse } from 'next/server'

type UserTipo = 'consumidor' | 'lojista' | 'funcionario' | 'admin'

const rolePrefixes: Record<string, UserTipo[]> = {
  '/admin': ['admin'],
  '/funcionario': ['funcionario'],
  '/lojista': ['lojista'],
}

const tipoHome: Record<string, string> = {
  consumidor: '/',
  lojista: '/lojista',
  funcionario: '/funcionario',
  admin: '/admin',
}

function decodeJwtPayload(token: string): { tipo?: UserTipo } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('token')?.value
  const payload = token ? decodeJwtPayload(token) : null

  if (pathname === '/login' || pathname === '/register') {
    if (payload?.tipo) {
      return NextResponse.redirect(new URL(tipoHome[payload.tipo] || '/', request.url))
    }
    return NextResponse.next()
  }

  for (const [prefix, tipos] of Object.entries(rolePrefixes)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      if (!payload?.tipo) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      if (!tipos.includes(payload.tipo)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
