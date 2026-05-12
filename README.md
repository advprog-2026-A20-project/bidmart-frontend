# BidMart Frontend

Repository ini berisi frontend BidMart yang dipisahkan dari repository monolith. Frontend hanya berkomunikasi dengan backend melalui gateway API, bukan langsung ke service internal seperti listing-query-service atau auction-query-service.

## Framework

- Vite
- React
- React Router
- Axios
- Vitest

Masih ada halaman static legacy di `pages/`, `assets/js/`, dan `public/` untuk kompatibilitas alur lama.

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

## Run Dengan Docker

```bash
docker build -t bidmart-frontend .
docker run --env-file .env.example -p 5173:5173 bidmart-frontend
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

- Static legacy pages masih memakai `window.__API_URL__`; defaultnya sudah gateway lokal, tetapi deployment production perlu menyuntikkan gateway URL yang benar.
- Wallet endpoint saat ini masih memakai `/api/wallet/*`, sementara target routing gateway jangka panjang menyebut `/api/wallets/**`.
- Bid command saat ini masih lewat `/api/auctions/{auctionId}/bids`; target service masa depan dapat memindahkannya ke `/api/bids/**`.
