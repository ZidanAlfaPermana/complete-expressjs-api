import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class JurnalChanges1790741447025 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "jurnal_harian",
            "kegiatan",
            new TableColumn({
                name: "kegiatan",
                type: "text",
            })
        );

        await queryRunner.changeColumn(
            "jurnal_harian",
            "hambatan",
            new TableColumn({
                name: "hambatan",
                type: "text",
                isNullable: true
            })
        );

        await queryRunner.changeColumn(
            "jurnal_harian",
            "rencanaBesok",
            new TableColumn({
                name: "rencanaBesok",
                type: "text",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "jurnal_harian",
            "kegiatan",
            new TableColumn({
                name: "kegiatan",
                type: "varchar",
                length: "100"
            })
        );
    }

}
