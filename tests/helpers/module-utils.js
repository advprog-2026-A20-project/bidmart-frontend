import { vi } from 'vitest'

export const moduleVariants = [
  { label: 'public', basePath: '../../public/assets/js' },
]

const createStorageMock = () => {
  const store = new Map()

  return {
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
    get length() {
      return store.size
    },
  }
}

const ensureLocalStorage = () => {
  if (typeof globalThis.localStorage?.clear === 'function') {
    return globalThis.localStorage
  }

  const storage = createStorageMock()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: storage,
  })

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      writable: true,
      value: storage,
    })
  }

  return storage
}

export const importFresh = async (modulePath) => {
  vi.resetModules()
  return import(`${modulePath}?scenario=${Date.now()}-${Math.random()}`)
}

export const setPage = (pathnameWithSearch = '/pages/listings.html') => {
  document.body.innerHTML = ''
  ensureLocalStorage().clear()
  document.body.innerHTML = '<div id="navbar"></div><div id="footer"></div>'
  window.history.replaceState({}, '', pathnameWithSearch)
  window.__API_URL__ = '/api'
  window.setInterval = vi.fn(() => 1)
  window.requestAnimationFrame = vi.fn((callback) => callback())
  window.confirm = vi.fn(() => true)
}

export const flushPromises = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

export const jsonResponse = (payload, init = {}) => ({
  ok: init.ok ?? true,
  status: init.status ?? 200,
  headers: new Headers({ 'content-type': 'application/json', ...(init.headers || {}) }),
  json: vi.fn(async () => payload),
})

export const jsonFailureResponse = (payload, status = 400) => ({
  ok: false,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: vi.fn(async () => payload),
})

export const textResponse = (ok = true, status = 200) => ({
  ok,
  status,
  headers: new Headers({ 'content-type': 'text/plain' }),
})

export const invalidJsonResponse = (ok = true, status = 200) => ({
  ok,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: vi.fn(async () => {
    throw new Error('invalid json')
  }),
})
