import { FindOptionsOrder, FindOptionsWhere, Repository } from "typeorm";
import { JurnalHarian, Mentor, Peserta } from "../entities";
import { JurnalFilter } from "../repositories/jurnal.repository";
import { ListQuery } from "../utils/pagination";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/AppError";
import { JurnalDto } from "../dto/jurnal.dto";

export const SORT_JURNAL = ["createdAt", "statusReview"] as const;

export interface Pengguna {
    id: number;
    role: "peserta" | "mentor";
}

export class JurnalService {
    constructor(
        private readonly pesertaRepo: Repository<Peserta>,
        private readonly jurnalRepo: Repository<JurnalHarian>,
        private readonly mentorRepo: Repository<Mentor>
    ) {}

    async getSemuaJurnal(lq: ListQuery, filter: JurnalFilter) {
        const where = filter as FindOptionsWhere<JurnalHarian>;

        const sortBy = SORT_JURNAL.find(k => k === lq.sortBy) ?? "createdAt";
        const order = { [sortBy]: lq.order ?? "DESC" } as FindOptionsOrder<JurnalHarian>;

        const [data, total] = await this.jurnalRepo.findAndCount({
            where,
            order,
            skip: (lq.page - 1) * lq.limit,
            take: lq.limit,
        });

        return { data, total, page: lq.page, limit: lq.limit };
    }

    async getTotalJurnal() {
        return String(await this.jurnalRepo.count());
    }

    async getTotalJurnalBelumReview() {
        return String(await this.jurnalRepo.countBy({ statusReview: "belum" }));
    }

    async getRataRataJurnalPeserta() {
        const [totalJurnal, totalPeserta] = await Promise.all([
            this.jurnalRepo.count(),
            this.pesertaRepo.count(),
        ]);

        if (totalPeserta === 0) return "0";
        return (totalJurnal / totalPeserta).toFixed(2);
    }

    getJurnalById(id: number) {
        return this.jurnalRepo.findOneBy({ id });
    }

    getJurnalByPesertaId(pesertaId: number) {
        return this.jurnalRepo.find({ where: { pesertaId } });
    }

    getJurnalDenganPeserta() {
        return this.jurnalRepo.find({ relations: { peserta: true } });
    }

    async getUserIdFromJurnal(idJurnal: number) {
        const jurnal = await this.jurnalRepo.findOne({
            where: { id: idJurnal },
            select: { id: true, pesertaId: true },
        });
        return jurnal?.pesertaId ?? null;
    }

    buatJurnal(pesertaId: number, dto: JurnalDto) {
        return this.jurnalRepo.save({ ...dto, pesertaId });
    }

    async updateJurnal(id: number, dto: JurnalDto, pengguna: Pengguna) {
        const jurnal = await this.ambilJurnalYangBolehDiubah(id, pengguna);
        Object.assign(jurnal, { hambatan: null, linkCommit: null, lampiran: null, ...dto });
        return this.jurnalRepo.save(jurnal);
    }

    async updateBeberapaDataJurnal(id: number, dto: JurnalDto, pengguna: Pengguna) {
        const jurnal = await this.ambilJurnalYangBolehDiubah(id, pengguna);
        Object.assign(jurnal, dto);
        return this.jurnalRepo.save(jurnal);
    }

    async updateReviewJurnal(
        id: number,
        pengguna: Pengguna,
        statusReview: "sudah" | "belum",
        catatan?: string,
        emailReviewer?: string
    ) {
        if (pengguna.role !== "mentor") {
            throw new ForbiddenError("Hanya mentor yang boleh me-review jurnal");
        }

        const jurnal = await this.cariJurnalAtauGagal(id);

        let reviewerId: number | null = null;
        if (statusReview === "sudah" && emailReviewer) {
            const mentor = await this.mentorRepo.findOneBy({ email: emailReviewer });
            reviewerId = mentor?.id ?? null;
        }

        jurnal.statusReview = statusReview;
        jurnal.catatanMentor = statusReview === "sudah" ? (catatan ?? null) : null;
        jurnal.reviewerId = reviewerId;
        return this.jurnalRepo.save(jurnal);
    }

    async hapusJurnal(id: number, pengguna: Pengguna) {
        const jurnal = await this.cariJurnalAtauGagal(id);
        this.pastikanPemilik(jurnal, pengguna);

        const result = await this.jurnalRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }

    private async cariJurnalAtauGagal(id: number) {
        const jurnal = await this.jurnalRepo.findOneBy({ id });
        if (!jurnal) throw new NotFoundError("Jurnal");
        return jurnal;
    }

    private pastikanPemilik(jurnal: JurnalHarian, pengguna: Pengguna) {
        if (jurnal.pesertaId !== pengguna.id) {
            throw new ForbiddenError("Anda tidak boleh mengubah jurnal milik peserta lain");
        }
    }

    private async ambilJurnalYangBolehDiubah(id: number, pengguna: Pengguna) {
        const jurnal = await this.cariJurnalAtauGagal(id);
        this.pastikanPemilik(jurnal, pengguna);

        if (jurnal.statusReview === "sudah") {
            throw new ConflictError("Jurnal yang sudah direview tidak dapat diedit");
        }
        return jurnal;
    }
}