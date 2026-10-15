import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUniqueIdPesertaFromJurnal1792079490832 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "jurnal_harian" DROP CONSTRAINT IF EXISTS "jurnal_harian_pesertaId_key"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "jurnal_harian" ADD CONSTRAINT "jurnal_harian_pesertaId_key" UNIQUE ("pesertaId")`
        );
    }

}
