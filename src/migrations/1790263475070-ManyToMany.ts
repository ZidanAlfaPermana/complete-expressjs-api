import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class ManyToMany1790263475070 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.createTable(
            new Table({
                name: "skill",
                columns: [
                    { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                    { name: "nama", type: "varchar", isUnique: true }
                ]
            }),
            true
        );

        await queryRunner.createTable(
            new Table({
                name: "peserta_skill",
                columns: [
                    { name: "pesertaId", type: "int", isPrimary: true },
                    { name: "skillId", type: "int", isPrimary: true }
                ]
            }),
            true
        );

        await queryRunner.createForeignKeys("peserta_skill", [
            new TableForeignKey({
                columnNames: ["pesertaId"],
                referencedTableName: "peserta",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames: ["skillId"],
                referencedTableName: "skill",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {const table = await queryRunner.getTable("peserta_skill");
        if (table) {
            await queryRunner.dropForeignKeys("peserta_skill", table.foreignKeys);
        }

        await queryRunner.dropTable("peserta_skill");
        await queryRunner.dropTable("skill");
    }

}
