# BidMart Frontend

Repository ini berisi frontend BidMart yang dipisahkan dari repository monolith. Frontend hanya berkomunikasi dengan backend melalui gateway API, bukan langsung ke service internal seperti listing-query-service atau auction-query-service.

## Framework

- Vite
- Vitest

Boundary frontend diringkas di `docs/service-boundary.md`.

Frontend ini memakai halaman HTML dan JavaScript statis yang diserve dari folder `public/`. Halaman berada di `public/pages/`, sedangkan module JavaScript berada di `public/assets/js/`.

## Install Dependency

```bash
npm install
```

Untuk instalasi reproducible di CI:

```bash
npm ci
```

## Run Lokal

```bash
npm run dev
```

Secara default frontend akan berjalan di Vite dev server dan memanggil gateway di:

```text
http://localhost:8080/api
```

## Build

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Test

```bash
npm test
```

## Environment Variable

Buat file `.env.local` dari `.env.example` untuk development lokal. Jangan commit `.env` atau `.env.local`.

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

`VITE_API_BASE_URL` harus menunjuk ke gateway. Jangan arahkan frontend langsung ke service internal seperti `http://localhost:8081` atau `http://localhost:8082`.

Untuk Vercel, set environment variable berikut:

```text
VITE_API_BASE_URL=https://<your-gateway-heroku-app>.herokuapp.com/api
```

Saat `npm run build`, nilai `VITE_API_BASE_URL` ditulis ke `public/runtime-config.js` dan ikut masuk ke `dist/runtime-config.js`. File ini sengaja diberi cache policy `no-store` pada `vercel.json` agar perubahan gateway URL cepat terbaca.

## Mapping Fitur ke Endpoint Gateway

| Fitur frontend | Endpoint gateway |
| --- | --- |
| Login | `POST /api/auth/login` |
| Register | `POST /api/auth/register` |
| Current user | `GET /api/auth/me` |
| Listing catalog | `GET /api/listings` |
| Listing detail | `GET /api/listings/{listingId}` |
| Listing categories | `GET /api/listings/categories/tree` |
| Create auction/listing flow | `POST /api/auctions` |
| Auction list | `GET /api/auctions` |
| Auction detail | `GET /api/auctions/{auctionId}` |
| Bid history | `GET /api/auctions/{auctionId}/bids` |
| Place bid | `POST /api/auctions/{auctionId}/bids` |
| Wallet balance | `GET /api/wallet/balance` |
| Wallet top up | `POST /api/wallet/topup` |
| Wallet transactions | `GET /api/wallet/transactions` |
| Seller public profile | `GET /api/users/{userId}/public-profile` |

## Endpoint yang Perlu Dicek Ulang

- Static pages memakai `window.__API_URL__`; default lokal adalah gateway `localhost`, sedangkan production harus diisi lewat `VITE_API_BASE_URL`.
- Wallet endpoint saat ini masih memakai `/api/wallet/*`, sementara target routing gateway jangka panjang menyebut `/api/wallets/**`.
- Bid command saat ini masih lewat `/api/auctions/{auctionId}/bids`; target service masa depan dapat memindahkannya ke `/api/bids/**`.
