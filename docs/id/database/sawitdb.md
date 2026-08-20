# SawitDB Engine

SawitDB adalah mesin database berkas tunggal (`.sawit`) dalam ekosistem Rakta.js yang dikembangkan oleh **WowoEngine**.

## Kapan Menggunakannya
Gunakan SawitDB ketika aplikasi membutuhkan penyimpanan database ringan dalam satu berkas tanpa menginstal server database eksternal seperti PostgreSQL atau MySQL, namun tetap memerlukan atomic transaction (4KB page size) dan Write-Ahead Logging (WAL).

## Instalasi
Pilih SawitDB saat membuat aplikasi baru dengan Rakta CLI:

```bash
bun create rakta aplikasi-saya --fullstack --database=sawitdb
```

Atau instal paket driver secara manual:
- **JavaScript / TypeScript**: `bun add @wowoengine/sawitdb-ts`
- **PHP**: `composer require wowoengine/sawitdb-php`

## Konfigurasi
Atur jalur file database `.sawit` pada file `.env`:

```env
SAWITDB_FILE=./data/app.sawit
SAWITDB_PAGE_SIZE=4096
SAWITDB_WAL=true
```

## Contoh Penggunaan

### JavaScript / TypeScript (Gaman.js & Hono.js)
```typescript
import { databaseClient } from "./database/client";

const db = await databaseClient.connect(process.env.SAWITDB_FILE || "./data/app.sawit");
const users = await db.query("SELECT * FROM users WHERE status = ?", ["active"]);
```

### PHP (Laravel & CodeIgniter 4)
```php
use WowoEngine\SawitDB\Facades\SawitDB;

$users = SawitDB::query("SELECT * FROM users WHERE role = ?", ['admin']);
```

## Integrasi dengan Rakta.js
SawitDB diintegrasikan secara otomatis oleh CLI ketika opsi `--database=sawitdb` dipilih. File koneksi dihasilkan pada `backend/src/database/client.ts` untuk backend TypeScript atau `backend/app/Database/` untuk backend PHP.

## Development
Secara lokal, file `.sawit` akan otomatis dibuat pada direktori `./data/` aplikasi saat pertama kali berjalan.

## Production
Untuk penggelaran production, pastikan direktori penyimpanan file `.sawit` memiliki izin akses tulis (write permission) dan buat cadangan berkas `.sawit` secara teratur.

## Catatan
- Format file: Single file database engine (`.sawit`)
- Pengembang: WowoEngine
- Bahasa Query: AQL (Agricultural Query Language) & subset SQL standar.
