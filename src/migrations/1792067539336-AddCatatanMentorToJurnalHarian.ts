import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddCatatanMentorToJurnalHarian1792067539336 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "jurnal_harian",
            new TableColumn({
                name: "catatanMentor",
                type: "text",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("jurnal_harian", "catatanMentor");
    }

}
