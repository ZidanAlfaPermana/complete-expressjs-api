import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class RelationMigration1790219594580 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "jurnal_harian",
            new TableForeignKey({
                name: "FK_Jurnal_Peserta",
                columnNames: ["pesertaId"],
                referencedTableName: "peserta",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("jurnal_harian", "FK_Jurnal_Peserta");

    }

}
