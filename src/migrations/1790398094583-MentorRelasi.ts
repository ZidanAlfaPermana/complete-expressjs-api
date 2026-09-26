import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class MentorRelasi1790398094583 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn(
            "jurnal_harian",
            new TableColumn({
                name: "reviewerId",
                type: "int",
                isNullable: true
            })
        );

        await queryRunner.createForeignKey(
            "jurnal_harian",
            new TableForeignKey({
                name: "FK_Jurnal_Mentor",
                columnNames: ["reviewerId"],
                referencedTableName: "mentor",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("jurnal_harian", "FK_Jurnal_Mentor");
        await queryRunner.dropColumn("jurnal_harian", "reviewer_id");
    }
}
