import { JurnalRepository } from "../repositories";
import { AppDataSource } from "../config/database.config";
import { Peserta } from "../entities";
import {JurnalFilter} from "../repositories/jurnal.repository";
import {ListQuery} from "../utils/pagination";
import {ConflictError, NotFoundError} from "../utils/AppError";

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

    async getSemuaJurnal(lq: ListQuery, filter: JurnalFilter) {
        return this.jurnalRepo.findPaginated(lq, filter);
    }

    async getTotalJurnal() {
        const total = await this.jurnalRepo.count();
        return String(total);
    }

    async getTotalJurnalBelumReview() {
        const total = await this.jurnalRepo.countByReview("belum");
        return String(total);
    }

    async updateStatusReview(id: number, review: "sudah" | "belum") {
        const jurnal = await this.jurnalRepo.findById(id);
        if (!jurnal) return null;

        jurnal.review = review;
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

    async buatJurnal(data: JurnalBody) {
        const pesertaExists = await this.pesertaRepo.findOneBy({ id: data.pesertaId });
        if (!pesertaExists) {
            throw new ConflictError(`Peserta dengan id ${data.pesertaId} tidak ditemukan`);
        }

        return this.jurnalRepo.save({
            pesertaId: data.pesertaId,
            status: data.status,
            kegiatan: data.kegiatan,
            hambatan: data.hambatan,
            rencanaBesok: data.rencanaBesok,
            linkCommit: data.linkCommit,
            review: data.review,
            reviewerId: data.reviewerId
        });
    }

    async updateJurnal(id: number, data: JurnalBody) {
        const jurnal = await this.jurnalRepo.findById(id);
        if (!jurnal) return null;

        const pesertaExists = await this.pesertaRepo.findOneBy({ id: data.pesertaId });
        if (!pesertaExists) {
            throw new NotFoundError(`Peserta dengan id ${data.pesertaId} tidak ditemukan`);
        }

        return this.jurnalRepo.save({
            ...jurnal,
            ...data
        });
    }

    async hapusJurnal(id: number) {
        const result = await this.jurnalRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async getUserIdFromJurnal(idJurnal: number) {
        return this.jurnalRepo.getUserIdFromJurnalId(idJurnal);
    }
}