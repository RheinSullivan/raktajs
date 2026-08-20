# Integrasi MySQL

MySQL adalah sistem database relasional populer yang didukung oleh seluruh backend Rakta.js.

## Penggunaan CLI
```bash
bun create rakta aplikasi-saya --fullstack --database=mysql
```

## Fitur Utama
- Kecepatan query tinggi, struktur tabel relasional standar, dan dukungan hosting sangat luas.

## Contoh Konfigurasi `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rakta_db
DB_USERNAME=root
DB_PASSWORD=secret
```
