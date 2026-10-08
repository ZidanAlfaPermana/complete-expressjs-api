import "reflect-metadata";
import { Peserta } from "../entities";
import { hashPassword } from "../utils/password";
import {AppDataSource} from "../config/database.config";

const SEKOLAH = ["SMKN 5 Malang", "SMKN 4 Malang", "SMK Telkom Malang", "SMKN 2 Singosari", "SMK Brawijaya"];
const NAMA_DEPAN = ["Andi", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hadi", "Indah", "Joko"];
const NAMA_BELAKANG = ["Pratama", "Lestari", "Wijaya", "Saputra", "Kusuma"];
const STATUS = ["aktif", "aktif", "aktif", "lulus", "berhenti"] as const;

async function seed() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Peserta);

    await repo
        .createQueryBuilder()
        .delete()
        .where("email LIKE :d", { d: "%@seed.test" })
        .execute();

    const hashed = await hashPassword("password123");

    const data = Array.from({ length: 50 }, (_, i) => {
        const n = i + 1;
        return repo.create({
            nama: `${NAMA_DEPAN[i % NAMA_DEPAN.length]} ${NAMA_BELAKANG[i % NAMA_BELAKANG.length]} ${n}`,
            email: `peserta${String(n).padStart(2, "0")}@seed.test`,
            password: hashed,
            sekolah: SEKOLAH[i % SEKOLAH.length],
            fase: (i % 3) + 1,
            status: STATUS[i % STATUS.length],
            role: "peserta",
        });
    });

    await repo.save(data);
    console.log(`Seed selesai: ${data.length} peserta`);
    await AppDataSource.destroy();
}

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});