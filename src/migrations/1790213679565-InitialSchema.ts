import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1790213679565 implements MigrationInterface {

    /*
    *
    * Tabel migration ini mencatat riwayat file migrasi apa saja yang sudah berhasil dieksekusi.
    * Tujuannya agar TypeORM tidak mengeksekusi file yang sama dua kali,
    * sehingga mencegah error seperti membuat tabel yang sudah ada.
    * */
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "peserta"
            (
                "id" SERIAL PRIMARY KEY,
                "nama" varchar(100) NOT NULL,
                "sekolah" varchar(100) NOT NULL,
                "email" varchar(100) UNIQUE NOT NULL,
                "fase" int DEFAULT 1,
                "status" varchar DEFAULT 'aktif',
                "createdAt" TIMESTAMP DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "jurnal_harian"
            (
                "id" SERIAL PRIMARY KEY,
                "pesertaId" int UNIQUE NOT NULL,
                "kegiatan" varchar(100) NOT NULL,
                "hambatan" varchar(100) NOT NULL,
                "linkCommit" varchar(100),
                "review" varchar DEFAULT 'belum',
                "createdAt" TIMESTAMP DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "mentor"
            (
                "id" SERIAL PRIMARY KEY,
                "nama" varchar(100) NOT NULL,
                "email" varchar(100) UNIQUE NOT NULL,
                "keahlian" jsonb,
                "createdAt" TIMESTAMP DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "peserta"`);
        await queryRunner.query(`DROP TABLE "jurnal_harian"`);
        await queryRunner.query(`DROP TABLE "mentor"`);
    }

}
