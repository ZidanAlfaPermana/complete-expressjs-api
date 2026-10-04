import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class RefreshSecret1791036128044 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "refresh_token",
                columns: [
                    { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                    { name: "token", type: "varchar" },
                    { name: "expiresAt", type: "timestamp" },
                    { name: "createdAt", type: "timestamp", default: "now()" },
                    { name: "pesertaId", type: "int", isNullable: true }
                ]
            }),
            true
        );

        await queryRunner.createForeignKey(
            "refresh_token",
            new TableForeignKey({
                name: "FK_RefreshToken_Peserta",
                columnNames: ["pesertaId"],
                referencedTableName: "peserta",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("refresh_token", "FK_RefreshToken_Peserta");
        await queryRunner.dropTable("refresh_token");
    }

}
