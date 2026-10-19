// tests/setup.ts — dijalankan SEBELUM modul aplikasi di-import
// Penting: env.config milikmu melempar error kalau variabel wajib tidak ada,
// jadi isi semuanya di sini (sesuaikan dengan variabel wajib di env.config-mu).
import "reflect-metadata";

process.env.NODE_ENV = "test";
process.env.DB_NAME = "magang_test";
process.env.DB_USER = "test";
process.env.DB_PASSWORD = "test";
process.env.JWT_SECRET = "secret-khusus-test";
process.env.JWT_REFRESH_SECRET = "refresh-khusus-test";