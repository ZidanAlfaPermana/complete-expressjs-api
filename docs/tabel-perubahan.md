## Hasil Uji Query Parameter: Sebelum dan Sesudah Validasi

Endpoint yang diuji: `GET api/v1/peserta`

| # | Input | Target sesudah | Sebelum                                                                                                      | Sesudah                                                                          |
|---|-------|----------------|--------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| 1 | `page=0` | 400, page minimal 1 | 200, api mengembalikan data dengan page default 1                                                            | 422, melempar error validasi dengan pesan page minimal 1                         |
| 2 | `page=abc` | 400, page harus angka bulat | 200, sama seperti page=0 api mengembalikan data dengan page default 1                                        | 422, melempar error validasi page minimal 1 dan page harus berupa bilangan bulat |
| 3 | `limit=1000` | 400 atau dibatasi ke maksimum (mis. 100) | 200, api mengembalikan data dengan limit maksimal yaitu 100                                                  | 422, melempar error validasi limit maksimal 100                                  |
| 4 | `limit=0` | 400, limit minimal 1 | 200, api mengembalikan data dengan limit default yaitu 20                                                    | 422, melempar error validasi limit maksimal 1                                    |
| 5 | `sortBy=password` | 400, hanya kolom whitelist (mis. `nama`, `createdAt`) | 200, api tetap mengembalikan data, namun tidak include dengan password alias diurutkan berdasarkan createdAt | 422, melempar error validasi harus salah satu dari: nama, fase, createdAt        |
| 6 | `order=sembarang` | 400, hanya `asc` atau `desc` | 200, api mengembalikan data dengan order default yaitu desc                                                  | 422, melempar error validasi order harus ASC atau DESC                           |
| 7 | `sekolah=a&sekolah=b` | 400, harus satu nilai (bukan array) | 200, api mengembalikan data namun filter diabaikan, semua sekolah muncul                                     | 422, melempar error validasi harus berupa teks ddan harus satu                   |
| 8 | `q=%20%20%20` (spasi saja) | Di-trim lalu dianggap kosong, atau 400 | 200, api mengembalikan data namun di-trim jadi kosong, pencarian tidak diterapkan                            | 200, api tetap mengembalikan data namun dengan menganggap trim kosong            |