// tests/unit/services/peserta.service.test.ts
import { Repository } from "typeorm";
import { Peserta } from "../../../src/entities";
import { PesertaService } from "../../../src/services";
import { ConflictError, NotFoundError } from "../../../src/utils/AppError";
import { buatMockRepo, MockRepo } from "../../helpers/mockRepo";

describe("PesertaService", () => {
    let repo: MockRepo;
    let service: PesertaService;

    beforeEach(() => {
        repo = buatMockRepo();
        // Cast diperlukan karena mock kita bukan Repository sungguhan
        service = new PesertaService(repo as unknown as Repository<Peserta>);
    });

    describe("getById", () => {
        it("mengembalikan peserta jika ditemukan", async () => {
            const peserta = { id: 1, nama: "Budi" };
            repo.findOne.mockResolvedValue(peserta);

            await expect(service.getPesertaById(1)).resolves.toEqual(peserta);
        });

        it("melempar NotFoundError jika peserta tidak ada", async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.getPesertaById(99)).rejects.toThrow(NotFoundError);
        });
    });

    describe("buat", () => {
        type Status = "aktif" | "lulus" | "berhenti"
        type Role = "peserta" | "mentor"
        const data = { nama: "Budi", sekolah: "SMK 5 Malang", email: "budi@mail.com", password: "asduawdasd", status: "aktif" as Status,  fase: 1, role: "peserta" as Role };

        it("menyimpan peserta baru jika email belum dipakai", async () => {
            repo.findOneBy.mockResolvedValue(null);
            repo.create.mockReturnValue({ ...data });
            repo.save.mockResolvedValue({ id: 1, ...data });

            const hasil = await service.buatPeserta(data);

            expect(hasil).toMatchObject({ id: 1, email: "budi@mail.com" });
            expect(repo.save).toHaveBeenCalledTimes(1);
        });

        it("melempar ConflictError dan TIDAK menyimpan jika email sudah terdaftar", async () => {
            repo.findOneBy.mockResolvedValue({ id: 5, email: data.email });

            await expect(service.buatPeserta(data)).rejects.toThrow(ConflictError);
            expect(repo.save).not.toHaveBeenCalled();
        });
    });

    describe("hapus", () => {
        it("berhasil jika ada baris yang terhapus", async () => {
            repo.delete.mockResolvedValue({ affected: 1, raw: [] });

            await expect(service.hapusPeserta(1)).resolves.toBeUndefined();
        });

        it("melempar NotFoundError jika tidak ada yang terhapus", async () => {
            repo.delete.mockResolvedValue({ affected: 0, raw: [] });

            await expect(service.hapusPeserta(99)).rejects.toThrow(NotFoundError);
        });
    });
});