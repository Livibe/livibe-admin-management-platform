export const SESSION_COOKIE = 'livibe_user'
export const TOKEN_COOKIE   = 'livibe_token'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ── Client-side helpers ────────────────────────────────────────────────────
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days = 30) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`
}

export function getClientUser(): string | null {
  return getCookie(SESSION_COOKIE)
}

export function getToken(): string | null {
  return getCookie(TOKEN_COOKIE)
}

export async function loginWithBackend(email: string, password: string): Promise<{ name: string; color: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Incorrect email or password.')
  }

  const data = await res.json() // { token, user: { email, name, color } }
  setCookie(SESSION_COOKIE, data.user.email)
  setCookie(TOKEN_COOKIE, data.token)
  return data.user
}

export function logout() {
  deleteCookie(SESSION_COOKIE)
  deleteCookie(TOKEN_COOKIE)
}
