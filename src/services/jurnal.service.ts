import { JurnalRepository } from "../repositories";
import { AppDataSource } from "../config/database.config";
import { Peserta } from "../entities";

interface JurnalFilter {
    idPeserta?: number;
    status?: "belum" | "selesai" | "proses";
    limit?: number;
}

interface JurnalBody {
    idPeserta: number;
    status: "belum" | "selesai" | "proses";
    kegiatan: string;
    hambatan?: string;
    rencanaBesok: string;
    linkCommit?: string;
    review: "sudah" | "belum";
    reviewerId: number;
}

export class JurnalService {
    private jurnalRepo = new JurnalRepository();
    private pesertaRepo = AppDataSource.getRepository(Peserta);

    async getSemuaJurnal(filters: JurnalFilter) {
        const where: any = {};

        if (filters.idPeserta) where.pesertaId = filters.idPeserta;
        if (filters.status) where.status = filters.status;

        const limit = filters.limit ?? 20;
        return this.jurnalRepo.findWithFilters(where, limit);
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
        const pesertaExists = await this.pesertaRepo.findOneBy({ id: data.idPeserta });
        if (!pesertaExists) {
            throw new Error(`Peserta dengan id ${data.idPeserta} tidak ditemukan`);
        }

        return this.jurnalRepo.save({
            pesertaId: data.idPeserta,
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

        const pesertaExists = await this.pesertaRepo.findOneBy({ id: data.idPeserta });
        if (!pesertaExists) {
            throw new Error(`Peserta dengan id ${data.idPeserta} tidak ditemukan`);
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