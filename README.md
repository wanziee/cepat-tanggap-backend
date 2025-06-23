# Backend Cepat Tanggap

Backend untuk aplikasi Cepat Tanggap yang digunakan untuk manajemen RT/RW dan laporan warga.

## Fitur

- Autentikasi pengguna (login, register, dll.)
- Manajemen pengguna (admin, RT, RW, warga)
- Manajemen laporan warga
- Manajemen keuangan (rekap kas)
- Filter data berdasarkan RT/RW

## Teknologi

- Node.js
- Express.js
- Sequelize (ORM)
- MySQL
- JWT (JSON Web Token)
- Bcrypt (hashing password)

## Instalasi

1. Clone repository
   ```bash
   git clone https://github.com/username/cepat-tanggap-backend.git
   cd cepat-tanggap-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Buat file `.env` berdasarkan `.env.example`
   ```bash
   cp .env.example .env
   ```

4. Sesuaikan konfigurasi database di file `.env`

5. Jalankan migrasi database
   ```bash
   npx sequelize-cli db:migrate
   ```

6. Jalankan seeder (opsional)
   ```bash
   npx sequelize-cli db:seed:all
   ```

7. Jalankan server
   ```bash
   npm run dev
   ```

## Struktur Direktori

```
backend/
├── config/           # Konfigurasi database
├── controllers/      # Controller untuk menangani request
├── docs/             # Dokumentasi API
├── middlewares/      # Middleware (auth, dll.)
├── migrations/       # File migrasi database
├── models/           # Model Sequelize
├── routes/           # Definisi rute API
├── seeders/          # Data seeder
└── utils/            # Utility functions
```

## API Documentation

Lihat dokumentasi lengkap di [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## Penggunaan

### Autentikasi

1. **Login**
   ```http
   POST /api/auth/login
   ```
   
   Body:
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

### Pengguna

1. **Daftar Pengguna**
   ```http
   POST /api/auth/register
   ```

2. **Dapatkan Semua Pengguna**
   ```http
   GET /api/users
   ```

3. **Dapatkan Pengguna Berdasarkan ID**
   ```http
   GET /api/users/:id
   ```

4. **Perbarui Pengguna**
   ```http
   PUT /api/users/:id
   ```

5. **Hapus Pengguna**
   ```http
   DELETE /api/users/:id
   ```

### Rekap Kas

1. **Dapatkan Semua Rekap Kas**
   ```http
   GET /api/rekap-kas
   ```

2. **Buat Rekap Kas Baru**
   ```http
   POST /api/rekap-kas
   ```

3. **Perbarui Rekap Kas**
   ```http
   PUT /api/rekap-kas/:id
   ```

4. **Hapus Rekap Kas**
   ```http
   DELETE /api/rekap-kas/:id
   ```

## Kontribusi

1. Fork repository
2. Buat branch baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -am 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## Lisensi

MIT
