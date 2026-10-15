import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameJurnalColoumn1792067804867 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn("jurnal_harian", "review", "statusReview");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn("jurnal_harian", "statusReview", "review");
    }

}
