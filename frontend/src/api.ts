export type ApiErrorBody = {
  message?: string
  error?: string
}

export type ApiRequestInit = Omit<RequestInit, 'body'> & {
  auth?: boolean
  body?: unknown
}

const DEFAULT_API_BASE = 'http://localhost:5000'

export function getApiBase(): string {
  return (import.meta.env.VITE_API_URL as string | undefined) ?? DEFAULT_API_BASE
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string): void {
  localStorage.setItem('token', token)
}

export function clearToken(): void {
  localStorage.removeItem('token')
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ApiErrorBody
    return data.message || data.error || `${res.status} ${res.statusText}`
  } catch {
    return `${res.status} ${res.statusText}`
  }
}

export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {}
): Promise<T> {
  const apiBase = getApiBase()
  const url = path.startsWith('http') ? path : `${apiBase}${path}`

  const headers = new Headers(init.headers)

  const wantsAuth = init.auth !== false
  if (wantsAuth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let body: BodyInit | null | undefined

  if (init.body === undefined) {
    body = undefined
  } else if (init.body === null) {
    body = null
  } else if (
    typeof init.body === 'string' ||
    init.body instanceof FormData ||
    init.body instanceof URLSearchParams ||
    init.body instanceof Blob ||
    init.body instanceof ArrayBuffer
  ) {
    body = init.body
  } else {
    // Default JSON handling for plain objects / numbers / booleans
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.body)
  }

  const { auth: _auth, ...fetchInit } = init
  const res = await fetch(url, { ...fetchInit, headers, body })
  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  // Some endpoints may return empty responses
  const text = await res.text()
  return (text ? (JSON.parse(text) as T) : (undefined as T))
}
