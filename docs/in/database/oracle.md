# Oracle Database

Oracle Database adalah sistem manajemen database relasional tingkat enterprise yang didukung dalam ekosistem Rakta.js.

## Kapan Menggunakannya
Gunakan Oracle Database untuk aplikasi skala besar yang membutuhkan ketersediaan tinggi, fitur keamanan enterprise, prosedur tersimpan PL/SQL, dan kompatibilitas dengan infrastruktur IT enterprise.

## Instalasi
Pilih Oracle Database saat membuat aplikasi baru dengan Rakta CLI:

```bash
bun create rakta aplikasi-saya --fullstack --database=oracle
```

Atau instal driver sesuai bahasa backend:
- **Node.js / Bun**: `bun add oracledb`
- **PHP**: `extension=oci8` / `pdo_oci`
- **Python**: `pip install oracledb`
- **Go**: `go get github.com/godror/godror`
- **Java**: Dependency `com.oracle.database.jdbc:ojdbc11`

## Konfigurasi
Atur parameter koneksi Oracle pada file `.env`:

```env
ORACLE_USER=admin
ORACLE_PASSWORD=secret_password
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
```

## Contoh Penggunaan

### TypeScript (Gaman.js / Express / Nest)
```typescript
import oracledb from "oracledb";

const connection = await oracledb.getConnection({
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING,
});

const result = await connection.execute(
  `SELECT id, name FROM users WHERE role = :role`,
  ["ADMIN"]
);
```

## Integrasi dengan Rakta.js
CLI menghasilkan modul koneksi database terisolasi di `backend/src/database/` yang membaca kredensial dari environment variable secara aman.

## Development
Secara lokal, Anda dapat menjalankan Oracle Database Express Edition (XE) melalui Docker:

```bash
docker run -d -p 1521:1521 -e ORACLE_PASSWORD=secret gvenzl/oracle-xe
```

## Production
Untuk production, gunakan Oracle Instant Client atau Oracle Cloud Autonomous Database dengan SSL/TLS wallet configuration.

## Catatan
- Membutuhkan biner Oracle Instant Client untuk beberapa environment runtime legacy.
