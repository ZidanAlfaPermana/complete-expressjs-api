import {JurnalRepository, MentorRepository} from "../repositories";
import { AppDataSource } from "../config/database.config";
import {Mentor, Peserta} from "../entities";
import {JurnalFilter} from "../repositories/jurnal.repository";
import {ListQuery} from "../utils/pagination";
import {ConflictError, NotFoundError} from "../utils/AppError";
import {JurnalDto} from "../dto/jurnal.dto";
import {Jurnal} from "../types";

interface JurnalBody {
    pesertaId: number;
    status: "belum" | "selesai" | "proses";
    kegiatan: string;
    hambatan?: string;
    rencanaBesok: string;
    linkCommit?: string;
    review: "sudah" | "belum";
    reviewerId: number;
}

export const SORT_JURNAL = ["createdAt", "statusReview"] as const;

export class JurnalService {
    private jurnalRepo = new JurnalRepository();
    private pesertaRepo = AppDataSource.getRepository(Peserta);
    private mentorRepo = new MentorRepository();

    private async ambilJurnalYangBolehDiubah(id: number) {
        const jurnal = await this.jurnalRepo.findById(id);
        if (!jurnal) return null;
        if (jurnal.statusReview === "sudah") {
            throw new ConflictError("Jurnal yang sudah direview tidak dapat diedit");
        }
        return jurnal;
    }

    async getSemuaJurnal(lq: ListQuery, filter: JurnalFilter) {
        return this.jurnalRepo.findPaginated(lq, filter);
    }

    async getTotalJurnal()  {
        // untuk test jest.
        /*try {
            return await this.jurnalRepo.count();
        } catch {
            return 0;
        }*/
        const total = await this.jurnalRepo.count();
        return String(total)
    }

    async getTotalJurnalBelumReview() {
        const total = await this.jurnalRepo.countByReview("belum");
        return String(total)
    }

    async updateReviewJurnal(id: number, statusReview: "sudah" | "belum", catatan?: string, emailReviewer?: string) {
        const jurnal = await this.jurnalRepo.findById(id);
        if (!jurnal) return null;

        let reviewerId: number | null = null;
        if (statusReview === "sudah" && emailReviewer) {
            const mentor = await this.mentorRepo.findByEmail(emailReviewer);
            reviewerId = mentor?.id ?? null;
        }

        jurnal.statusReview = statusReview;
        jurnal.catatanMentor = statusReview === "sudah" ? catatan! : null;
        jurnal.reviewerId = reviewerId;
        return this.jurnalRepo.save(jurnal);
    }

    async getRataRataJurnalPeserta() {
        const totalJurnal = await this.jurnalRepo.count();
        const totalPeserta = await this.pesertaRepo.count();

        if (totalPeserta === 0) return "0";

        const rataRata = totalJurnal / totalPeserta;
        return rataRata.toFixed(2);
    }

    async getJurnalById(id: number) {
        return this.jurnalRepo.findById(id);
    }

    async getJurnalByPesertaId(idPeserta: number) {
        return this.jurnalRepo.findByPesertaId(idPeserta);
    }

    async getJurnalDenganPeserta() {
        return this.jurnalRepo.getJurnalDenganPeserta();
    }

    async buatJurnal(pesertaId: number, dto: JurnalDto) {
        return this.jurnalRepo.save(
            await this.jurnalRepo.save({...dto, pesertaId})
        );
    }

    async updateJurnal(id: number, dto: JurnalDto) {
        const jurnal = await this.ambilJurnalYangBolehDiubah(id);
        if (!jurnal) return null;
        Object.assign(jurnal, { hambatan: null, linkCommit: null, lampiran: null, ...dto });
        return this.jurnalRepo.save(jurnal);
    }

    async updateBeberapaDataJurnal(id: number, dto: JurnalDto) {
        const jurnal = await this.ambilJurnalYangBolehDiubah(id);
        if (!jurnal) return null;
        Object.assign(jurnal, dto);
        return this.jurnalRepo.save(jurnal);
    }

    async hapusJurnal(id: number) {
        const result = await this.jurnalRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async getUserIdFromJurnal(idJurnal: number) {
        return this.jurnalRepo.getUserIdFromJurnalId(idJurnal);
    }
}