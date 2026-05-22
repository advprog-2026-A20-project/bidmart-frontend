import { defineConfig } from 'vitest/config'

const coverageTargets = [
  'public/assets/js/api.js',
  'public/assets/js/create-listing.js',
  'public/assets/js/lelang.js',
  'public/assets/js/lelang-detail.js',
  'public/assets/js/listing-detail.js',
  'public/assets/js/listings.js',
  'public/assets/js/seller-profile.js',
  'public/assets/js/wallet.js',
]

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: coverageTargets,
      all: true,
      thresholds: {
        lines: 98,
      },
    },
  },
})
