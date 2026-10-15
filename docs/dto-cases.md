# DTO Cases: Di Mana Tiap Aturan Validasi Ditaruh

## Ringkasan

| # | Aturan | Tempat | Status HTTP saat dilanggar |
|---|--------|--------|----------------------------|
| a | Format email valid | DTO | 422 |
| b | Email belum dipakai akun lain | Database (unique constraint) | 409 |
| c | Nama minimal 3 karakter | DTO | 422 |
| d | Peserta hanya boleh mengedit jurnal miliknya | Service | 403 |
| e | Fase bernilai 1 sampai 5 | DTO | 422 |
| f | Password minimal 8 karakter | DTO | 422 |
| g | `pesertaId` pada jurnal menunjuk peserta yang ada | Database (foreign key) | 409 |
| h | Jurnal yang sudah direview tidak boleh diedit lagi | Service | 409 (atau 403) |

## Detail per aturan

### a. Format email valid

- **Tempat:** DTO
- **Alasan:** Ini murni cek bentuk teks. Tidak perlu database atau data lain, jadi bisa ditolak paling awal dan murah, sebelum menyentuh service.
- **Implementasi:**

  ```ts
  @IsEmail({}, { message: "Format email tidak valid" })
  email!: string;
  ```

- **Lapisan cadangan:** tidak perlu. Database hanya menyimpan string, bukan memeriksa format.

### b. Email belum dipakai akun lain

- **Tempat:** Database (unique constraint)
- **Alasan:** Aturan ini bergantung pada data lain di tabel. DTO tidak bisa tahu isi tabel. Pengecekan di service (cari email lalu insert) punya celah: dua request bersamaan bisa sama-sama lolos cek, lalu keduanya insert. Hanya unique constraint yang menjamin tidak ada duplikat.
- **Implementasi:** sudah ada di entity `Peserta`:

  ```ts
  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;
  ```

  Error `duplicate key value violates unique constraint` ditangkap error handler dan diubah menjadi 409 dengan pesan yang ramah.
- **Lapisan cadangan:** service boleh mengecek lebih dulu (`findByEmail`) hanya untuk memberi pesan error lebih jelas. Tapi itu pelengkap, bukan penjaga utama.

### c. Nama minimal 3 karakter

- **Tempat:** DTO
- **Alasan:** Aturan panjang teks bisa diputuskan dari isi request saja.
- **Implementasi:**

  ```ts
  @Trim()
  @IsString()
  @MinLength(3, { message: "Nama minimal 3 karakter" })
  @MaxLength(100)
  nama!: string;
  ```

  `@Trim()` ditaruh sebelum validasi supaya `"  ab "` tidak lolos sebagai 3 karakter.
- **Lapisan cadangan:** batas atas sudah dijaga `varchar(100)` di database. Batas bawah tidak perlu dijaga di database.

### d. Peserta hanya boleh mengedit jurnal miliknya

- **Tempat:** Service
- **Alasan:** Ini aturan otorisasi. Butuh dua hal yang tidak dimiliki DTO maupun database: identitas user yang login (dari token) dan pemilik jurnal yang tersimpan. Database tidak tahu siapa yang sedang login.
- **Implementasi:**

  ```ts
  const jurnal = await this.jurnalRepo.findById(id);
  if (!jurnal) return null;                          // 404
  if (jurnal.pesertaId !== pesertaIdDariToken) {
      throw new ForbiddenError("Bukan jurnal milikmu"); // 403
  }
  ```

  `pesertaIdDariToken` berasal dari `req.user.id`, bukan dari body.
- **Lapisan cadangan:** tidak ada. Jangan percaya `pesertaId` dari client.

### e. Fase bernilai 1 sampai 5

- **Tempat:** DTO
- **Alasan:** Rentang nilai bisa dicek dari input saja.
- **Implementasi:**

  ```ts
  @Type(() => Number)
  @IsInt({ message: "Fase harus berupa bilangan bulat" })
  @Min(1, { message: "Fase minimal 1" })
  @Max(5, { message: "Fase maksimal 5" })
  fase!: number;
  ```

- **Lapisan cadangan:** opsional, `CHECK (fase BETWEEN 1 AND 5)` di database supaya data tetap bersih walau diubah lewat SQL manual. Lapisan utamanya tetap DTO karena memberi pesan error yang jelas ke client.

### f. Password minimal 8 karakter

- **Tempat:** DTO
- **Alasan:** Panjang harus dicek pada password asli sebelum di-hash. Setelah di-hash, panjangnya selalu sama (misalnya 60 karakter untuk bcrypt), jadi service dan database tidak bisa lagi memeriksanya.
- **Implementasi:**

  ```ts
  @IsString()
  @MinLength(8, { message: "Password minimal 8 karakter" })
  password!: string;
  ```

  Jangan pakai `@Trim()` pada password, karena spasi bisa jadi bagian dari password.
- **Lapisan cadangan:** tidak ada. Kolom `password` di database hanya berisi hash.

### g. `pesertaId` pada jurnal menunjuk peserta yang ada

- **Tempat:** Database (foreign key)
- **Alasan:** Ini integritas referensial: hanya database yang bisa menjamin baris induk benar-benar ada, bahkan saat peserta dihapus bersamaan dengan insert jurnal. Constraint `FK_Jurnal_Peserta` sudah ada di tabel.
- **Implementasi:** relasi di entity:

  ```ts
  @ManyToOne(() => Peserta, (peserta) => peserta.jurnalList, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "pesertaId" })
  peserta!: Peserta;
  ```

  Pelanggaran menghasilkan error `violates foreign key constraint`, yang diubah error handler menjadi 409.
- **Lapisan cadangan:** pada endpoint buat jurnal, `pesertaId` diambil dari token (bukan dari body), jadi jarang terjadi. Kalau ada endpoint yang menerima `pesertaId` dari client, DTO cukup memeriksa bentuknya (`@IsInt @Min(1)`), sedangkan keberadaannya tetap dijaga foreign key.

### h. Jurnal yang sudah direview tidak boleh diedit lagi

- **Tempat:** Service
- **Alasan:** Aturan ini bergantung pada status data yang sudah tersimpan (`statusReview`). DTO hanya melihat request dan tidak tahu kondisi jurnal saat ini. Database juga tidak cocok, karena butuh trigger untuk aturan bisnis seperti ini, dan itu sulit dirawat.
- **Implementasi:**

  ```ts
  const jurnal = await this.jurnalRepo.findById(id);
  if (!jurnal) return null;                                   // 404
  if (jurnal.statusReview === "sudah") {
      throw new ConflictError("Jurnal yang sudah direview tidak dapat diedit"); // 409
  }
  ```

  Urutan pengecekan di service: ada atau tidak (404), milik siapa (aturan d, 403), baru kemudian status (aturan h).
- **Lapisan cadangan:** tidak ada. Terapkan juga pada endpoint hapus jurnal kalau aturannya sama.

## Rangkuman

| Lapisan | Aturan | Sifat |
|---------|--------|-------|
| DTO | a, c, e, f | Cek bentuk dan nilai dari input saja |
| Service | d, h | Aturan bisnis yang butuh user login atau kondisi data tersimpan |
| Database | b, g | Integritas data antar baris yang harus dijamin walau ada request bersamaan |
