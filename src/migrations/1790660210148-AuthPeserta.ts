import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthPeserta1790660210148 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "peserta" ADD IF NOT EXISTS "password" varchar(100);
            ALTER TABLE "peserta" ADD IF NOT EXISTS "role" varchar(50)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "peserta" DROP "password";
            ALTER TABLE "peserta" DROP "role";
        `)
    }

}
