import { MigrationInterface, QueryRunner } from "typeorm";

export class PerubahanPeserta1790215127979 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "peserta" ADD IF NOT EXISTS "telepon" int
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE "peserta" DROP "telepon"
        `)
    }

}
