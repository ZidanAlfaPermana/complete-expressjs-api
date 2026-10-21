import { JurnalService } from "../../../src/services";
import type { Pengguna } from "../../../src/services/jurnal.service";
import type { Repository } from "typeorm";
import type { JurnalHarian, Mentor, Peserta } from "../../../src/entities";
import type { JurnalDto } from "../../../src/dto/jurnal.dto";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../src/utils/AppError";
import { buatMockRepo, MockRepo } from "../../helpers/mockRepo";

const PEMILIK: Pengguna = { id: 1, role: "peserta" };
const PESERTA_LAIN: Pengguna = { id: 2, role: "peserta" };
const MENTOR: Pengguna = { id: 99, role: "mentor" };

const dtoUbah = { kegiatan: "Belajar Jest", rencanaBesok: "Menulis test" } as JurnalDto;

function buatJurnal(perubahan: Record<string, unknown> = {}) {
    return {
        id: 10,
        pesertaId: PEMILIK.id,
        kegiatan: "Belajar TypeORM",
        statusReview: "belum",
        catatanMentor: null,
        reviewerId: null,
        ...perubahan,
    };
}

describe("JurnalService", () => {
    let pesertaRepo: MockRepo;
    let jurnalRepo: MockRepo;
    let mentorRepo: MockRepo;
    let service: JurnalService;

    beforeEach(() => {
        pesertaRepo = buatMockRepo();
        jurnalRepo = buatMockRepo();
        mentorRepo = buatMockRepo();
        jurnalRepo.save.mockImplementation(async (entitas: object) => entitas);

        service = new JurnalService(
            pesertaRepo as unknown as Repository<Peserta>,
            jurnalRepo as unknown as Repository<JurnalHarian>,
            mentorRepo as unknown as Repository<Mentor>
        );
    });

    describe("hak akses peserta", () => {
        it("peserta tidak bisa mengubah (PUT) jurnal milik peserta lain", async () => {
            jurnalRepo.findOneBy.mockResolvedValue(buatJurnal());

            await expect(service.updateJurnal(10, dtoUbah, PESERTA_LAIN)).rejects.toBeInstanceOf(ForbiddenError);
            expect(jurnalRepo.save).not.toHaveBeenCalled();
        });

        it("peserta tidak bisa mengubah sebagian (PATCH) jurnal milik peserta lain", async () => {
            jurnalRepo.findOneBy.mockResolvedValue(buatJurnal());

            await expect(service.updateBeberapaDataJurnal(10, dtoUbah, PESERTA_LAIN)).rejects.toBeInstanceOf(ForbiddenError);
            expect(jurnalRepo.save).not.toHaveBeenCalled();
        });

        it("peserta tidak bisa menghapus jurnal milik peserta lain", async () => {
            jurnalRepo.findOneBy.mockResolvedValue(buatJurnal());

            await expect(service.hapusJurnal(10, PESERTA_LAIN)).rejects.toBeInstanceOf(ForbiddenError);
            expect(jurnalRepo.delete).not.toHaveBeenCalled();
        });

        it("pemilik bisa mengubah jurnalnya sendiri", async () => {
            jurnalRepo.findOneBy.mockResolvedValue(buatJurnal());

            const hasil = await service.updateBeberapaDataJurnal(10, dtoUbah, PEMILIK);

            expect(hasil).toMatchObject({ id: 10, kegiatan: "Belajar Jest" });
        });

        it("pemilik bisa menghapus jurnalnya sendiri", async () => {
            jurnalRepo.findOneBy.mockResolvedValue(buatJurnal());
            jurnalRepo.delete.mockResolvedValue({ affected: 1 });

            await expect(service.hapusJurnal(10, PEMILIK)).resolves.toBe(true);
        });

        it("jurnal yang sudah direview tidak bisa diedit meski oleh pemiliknya", async () => {
            jurnalRepo.findOneBy.mockResolvedValue(buatJurnal({ statusReview: "sudah" }));

            await expect(service.updateJurnal(10, dtoUbah, PEMILIK)).rejects.toBeInstanceOf(ConflictError);
            expect(jurnalRepo.save).not.toHaveBeenCalled();
        });
    });

    describe("review oleh mentor", () => {
        it("mentor boleh me-review jurnal milik peserta mana pun", async () => {
            jurnalRepo.findOneBy.mockResolvedValue(buatJurnal({ pesertaId: 55 }));
            mentorRepo.findOneBy.mockResolvedValue({ id: 99, email: "mentor@mail.com" });

            const hasil = await service.updateReviewJurnal(10, MENTOR, "sudah", "Sudah bagus", "mentor@mail.com");

            expect(hasil).toMatchObject({
                statusReview: "sudah",
                catatanMentor: "Sudah bagus",
                reviewerId: 99,
            });
        });

        it("peserta tidak boleh me-review jurnal, bahkan miliknya sendiri", async () => {
            jurnalRepo.findOneBy.mockResolvedValue(buatJurnal());

            await expect(
                service.updateReviewJurnal(10, PEMILIK, "sudah", "Menilai sendiri", "budi@mail.com")
            ).rejects.toBeInstanceOf(ForbiddenError);
            expect(jurnalRepo.save).not.toHaveBeenCalled();
        });
    });

    describe("jurnal tidak ditemukan", () => {
        beforeEach(() => {
            jurnalRepo.findOneBy.mockResolvedValue(null);
        });

        it("update melempar NotFoundError", async () => {
            await expect(service.updateJurnal(404, dtoUbah, PEMILIK)).rejects.toBeInstanceOf(NotFoundError);
        });

        it("review melempar NotFoundError", async () => {
            await expect(service.updateReviewJurnal(404, MENTOR, "sudah", "Catatan")).rejects.toBeInstanceOf(NotFoundError);
        });

        it("hapus melempar NotFoundError", async () => {
            await expect(service.hapusJurnal(404, PEMILIK)).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});