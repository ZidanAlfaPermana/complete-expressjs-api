import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddLampiranToJurnal1792068439530 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "jurnal_harian",
            new TableColumn({
                name: "lampiran",
                type: "jsonb",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("jurnal_harian", "lampiran");
    }

}
