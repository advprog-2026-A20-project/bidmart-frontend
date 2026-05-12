const createMemoryStorage = () => {
  const data = new Map()

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      data.set(String(key), String(value))
    },
    removeItem(key) {
      data.delete(String(key))
    },
    clear() {
      data.clear()
    },
    key(index) {
      return Array.from(data.keys())[index] ?? null
    },
    get length() {
      return data.size
    },
  }
}

if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
  const storage = createMemoryStorage()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: storage,
  })
}
