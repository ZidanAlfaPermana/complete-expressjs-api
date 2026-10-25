// tests/helpers/db.ts
import { AppDataSource } from "../../src/config/database.config";

// Kosongkan semua tabel entity (tabel migrations tidak ikut) dan reset nomor id
export async function bersihkanDatabase(): Promise<void> {
    const tabel = AppDataSource.entityMetadatas.map((m) => `"${m.tableName}"`).join(", ");
    await AppDataSource.query(`TRUNCATE ${tabel} RESTART IDENTITY CASCADE`);
}