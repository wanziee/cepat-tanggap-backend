# Dokumentasi API Cepat Tanggap

Dokumentasi ini menjelaskan endpoint-endpoint API yang tersedia di sistem Cepat Tanggap.

## Daftar Isi

1. [Autentikasi](#autentikasi)
2. [Pengguna](#pengguna)
   - [Mendapatkan Semua Pengguna](#mendapatkan-semua-pengguna)
   - [Mendapatkan Pengguna Berdasarkan ID](#mendapatkan-pengguna-berdasarkan-id)
   - [Memperbarui Data Pengguna](#memperbarui-data-pengguna)
   - [Menghapus Pengguna](#menghapus-pengguna)
3. [Rekap Kas](#rekap-kas)
   - [Mendapatkan Semua Rekap Kas](#mendapatkan-semua-rekap-kas)
   - [Membuat Rekap Kas Baru](#membuat-rekap-kas-baru)
   - [Memperbarui Rekap Kas](#memperbarui-rekap-kas)
   - [Menghapus Rekap Kas](#menghapus-rekap-kas)

## Autentikasi

Semua endpoint memerlukan token autentikasi yang didapatkan saat login. Token harus disertakan di header `Authorization` dengan format `Bearer <token>`.

## Pengguna

### Mendapatkan Semua Pengguna

Mendapatkan daftar semua pengguna dengan filter opsional.

**Endpoint:** `GET /api/users`

**Query Parameters:**
- `rt` (opsional): Filter berdasarkan nomor RT
- `rw` (opsional): Filter berdasarkan nomor RW

**Contoh Request:**
```http
GET /api/users?rt=001&rw=001
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nik": "1234567890123456",
      "nama": "Admin",
      "email": "admin@example.com",
      "role": "admin",
      "alamat": "Jl. Contoh No. 1",
      "no_hp": "081234567890",
      "rt": "001",
      "rw": "001",
      "created_at": "2025-06-23T08:00:00.000Z",
      "updated_at": "2025-06-23T08:00:00.000Z"
    }
  ]
}
```

### Mendapatkan Pengguna Berdasarkan ID

Mendapatkan detail pengguna berdasarkan ID.

**Endpoint:** `GET /api/users/:id`

**Contoh Request:**
```http
GET /api/users/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nik": "1234567890123456",
    "nama": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "alamat": "Jl. Contoh No. 1",
    "no_hp": "081234567890",
    "rt": "001",
    "rw": "001",
    "created_at": "2025-06-23T08:00:00.000Z",
    "updated_at": "2025-06-23T08:00:00.000Z"
  }
}
```

### Memperbarui Data Pengguna

Memperbarui data pengguna berdasarkan ID.

**Endpoint:** `PUT /api/users/:id`

**Body:**
```json
{
  "nama": "Nama Baru",
  "email": "email@baru.com",
  "alamat": "Alamat Baru",
  "no_hp": "081234567891",
  "rt": "002",
  "rw": "001"
}
```

**Contoh Request:**
```http
PUT /api/users/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "nama": "Nama Baru",
  "email": "email@baru.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data pengguna berhasil diperbarui",
  "data": {
    "id": 1,
    "nama": "Nama Baru",
    "email": "email@baru.com",
    "role": "admin",
    "alamat": "Alamat Baru",
    "no_hp": "081234567891",
    "rt": "002",
    "rw": "001",
    "created_at": "2025-06-23T08:00:00.000Z",
    "updated_at": "2025-06-23T09:00:00.000Z"
  }
}
```

### Menghapus Pengguna

Menghapus pengguna berdasarkan ID.

**Endpoint:** `DELETE /api/users/:id`

**Contoh Request:**
```http
DELETE /api/users/2
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Pengguna berhasil dihapus"
}
```

## Rekap Kas

### Mendapatkan Semua Rekap Kas

Mendapatkan daftar semua rekap kas dengan filter opsional.

**Endpoint:** `GET /api/rekap-kas`

**Query Parameters:**
- `rt` (opsional): Filter berdasarkan nomor RT
- `rw` (opsional): Filter berdasarkan nomor RW
- `startDate` (opsional): Filter tanggal mulai (format: YYYY-MM-DD)
- `endDate` (opsional): Filter tanggal akhir (format: YYYY-MM-DD)

**Contoh Request:**
```http
GET /api/rekap-kas?rt=001&rw=001&startDate=2025-06-01&endDate=2025-06-30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tanggal": "2025-06-01",
      "keterangan": "Iuran Warga Bulan Juni",
      "jenis": "pemasukan",
      "jumlah": 500000,
      "saldo": 500000,
      "rt": "001",
      "rw": "001",
      "user_id": 1,
      "created_at": "2025-06-23T08:00:00.000Z",
      "updated_at": "2025-06-23T08:00:00.000Z",
      "user": {
        "id": 1,
        "nama": "Admin",
        "nik": "1234567890123456",
        "role": "admin",
        "rt": "001",
        "rw": "001"
      }
    }
  ]
}
```

### Membuat Rekap Kas Baru

Membuat data rekap kas baru.

**Endpoint:** `POST /api/rekap-kas`

**Body:**
```json
{
  "tanggal": "2025-06-25",
  "keterangan": "Pembelian peralatan kebersihan",
  "jenis": "pengeluaran",
  "jumlah": 250000,
  "saldo": 250000,
  "rt": "001",
  "rw": "001"
}
```

**Contoh Request:**
```http
POST /api/rekap-kas
Authorization: Bearer <token>
Content-Type: application/json

{
  "tanggal": "2025-06-25",
  "keterangan": "Pembelian peralatan kebersihan",
  "jenis": "pengeluaran",
  "jumlah": 250000,
  "saldo": 250000,
  "rt": "001",
  "rw": "001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data rekap kas berhasil ditambahkan",
  "data": {
    "id": 2,
    "tanggal": "2025-06-25",
    "keterangan": "Pembelian peralatan kebersihan",
    "jenis": "pengeluaran",
    "jumlah": 250000,
    "saldo": 250000,
    "rt": "001",
    "rw": "001",
    "user_id": 1,
    "updated_at": "2025-06-23T10:00:00.000Z",
    "created_at": "2025-06-23T10:00:00.000Z"
  }
}
```

### Memperbarui Rekap Kas

Memperbarui data rekap kas berdasarkan ID.

**Endpoint:** `PUT /api/rekap-kas/:id`

**Body:**
```json
{
  "keterangan": "Pembelian peralatan kebersihan (revisi)",
  "jumlah": 300000,
  "saldo": 200000
}
```

**Contoh Request:**
```http
PUT /api/rekap-kas/2
Authorization: Bearer <token>
Content-Type: application/json

{
  "keterangan": "Pembelian peralatan kebersihan (revisi)",
  "jumlah": 300000,
  "saldo": 200000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data rekap kas berhasil diperbarui",
  "data": {
    "id": 2,
    "tanggal": "2025-06-25",
    "keterangan": "Pembelian peralatan kebersihan (revisi)",
    "jenis": "pengeluaran",
    "jumlah": 300000,
    "saldo": 200000,
    "rt": "001",
    "rw": "001",
    "user_id": 1,
    "created_at": "2025-06-23T10:00:00.000Z",
    "updated_at": "2025-06-23T11:00:00.000Z"
  }
}
```

### Menghapus Rekap Kas

Menghapus data rekap kas berdasarkan ID.

**Endpoint:** `DELETE /api/rekap-kas/:id`

**Contoh Request:**
```http
DELETE /api/rekap-kas/2
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Data rekap kas berhasil dihapus"
}
```
