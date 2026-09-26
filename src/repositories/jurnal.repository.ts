import { AppDataSource } from "../config/database.config";
import { JurnalHarian } from "../entities";
import { FindOptionsWhere } from "typeorm";

export class JurnalRepository {
    private repo = AppDataSource.getRepository(JurnalHarian);

    async findWithFilters(where: FindOptionsWhere<JurnalHarian>, limit: number) {
        return this.repo.find({ where, take: limit });
    }

    async count() {
        return this.repo.count();
    }

    async countByReview(review: "sudah" | "belum") {
        return this.repo.count({ where: { review } });
    }

    async findById(id: number) {
        return this.repo.findOneBy({ id });
    }

    async findByPesertaId(pesertaId: number) {
        return this.repo.find({ where: { pesertaId } });
    }

    async getJurnalDenganPeserta() {
        return this.repo.find({ relations: { peserta: true } });
    }

    async save(data: Partial<JurnalHarian>) {
        return this.repo.save(data);
    }

    async delete(id: number) {
        return this.repo.delete(id);
    }
}