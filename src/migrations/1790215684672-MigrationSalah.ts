import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationSalah1790215684672 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            CREATE TABLE "salah"
            (
                "id" SERIAL PRIMARY KEY,
                "nama" varc(100) NOT NULL,
                "email" nomor(100) UNIQUE NOT NULL
            )
        `)
    }

    /*
    *
    * Fungsi Revert
    * Fitur revert di database bertindak sebagai undo di database untuk mencegah bentrok struktur database saat developer berpindah-pindah branch,
    * membatalkan kesalahan skema tanpa menyentuh database secara manual,
    * dan mengembalikan versi database jika terjadi error saat rilis ke production.
    * */
    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DROP TABLE "salah"`);
    }
}
