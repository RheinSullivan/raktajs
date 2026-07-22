# Compatibility Policy

Rakta.js menjaga API publik tetap backward compatible dalam major release yang
sama.

- Kapabilitas framework baru ditambahkan melalui subpath typed.
- Export publik yang sudah ada tidak dihapus tanpa jalur migrasi.
- Template bisa mendapat file baru, tetapi konvensi app hasil generator tetap
  kompatibel.
- Helper yang kompatibel edge menghindari API khusus Node kecuali adapter Node
  membutuhkannya.
- Breaking change hanya untuk major version dan wajib punya dokumentasi migrasi.
