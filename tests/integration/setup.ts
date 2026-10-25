// tests/integration/setup.ts
import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });   // tidak menimpa variabel yang sudah ada (mis. dari CI)

process.env.NODE_ENV = "test";
process.env.DB_NAME ??= "magang_test";
process.env.JWT_SECRET ??= "secret-integration-test";
process.env.JWT_REFRESH_SECRET ??= "refresh-integration-test";

// PENGAMAN WAJIB: integration test menjalankan TRUNCATE (menghapus semua data).
// Jangan pernah izinkan test menyentuh database selain yang berakhiran _test.
if (!process.env.DB_NAME?.endsWith("_test")) {
    throw new Error(
        `Integration test menolak berjalan di database "${process.env.DB_NAME}". ` +
        `Nama database wajib berakhiran _test.`
    );
}