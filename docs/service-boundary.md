# Frontend Boundary

Frontend hanya berkomunikasi dengan gateway melalui `/api/*`.

## Boleh Dilakukan

- Memanggil endpoint publik gateway.
- Menyimpan token di browser sesuai flow existing.
- Menampilkan data auction, listing, bidding, auth, dan wallet dari response gateway.

## Tidak Boleh Dilakukan

- Memanggil service internal langsung seperti `auction-query-service:8081`.
- Menyimpan secret backend.
- Menganggap URL service internal stabil untuk production.

## Dependency

- `bidmart-gateway` sebagai API facade.
- Vite untuk dev server dan build.
- Vitest untuk unit/component-level test.

## Catatan Migrasi

Selama strangler pattern, frontend harus tetap memakai kontrak lama `/api/*`. Perubahan route service di belakang gateway tidak boleh memaksa perubahan URL frontend.
