import { AppDataSource } from "../config/database.config";
import { JurnalHarian } from "../entities";
import {Between, FindOptionsOrder, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual} from "typeorm";
import { ListQuery } from "../utils/pagination";

export interface JurnalFilter {
    pesertaId?: number;
    review?: string;
    from?: Date;
    to?: Date;
}

export class JurnalRepository {
    private repo = AppDataSource.getRepository(JurnalHarian);

    async findWithFilters(where: FindOptionsWhere<JurnalHarian>, limit: number) {
        return this.repo.find({ where, take: limit });
    }

    async findPaginated(lq: ListQuery, filter: JurnalFilter) {
        const where: FindOptionsWhere<JurnalHarian> = {};

        if (filter.pesertaId) where.pesertaId = filter.pesertaId;
        if (filter.review) where.review = filter.review as any;

        if (filter.from && filter.to) where.createdAt = Between(filter.from, filter.to);
        else if (filter.from) where.createdAt = MoreThanOrEqual(filter.from);
        else if (filter.to) where.createdAt = LessThanOrEqual(filter.to);

        const [data, total] = await this.repo.findAndCount({
            where,
            order: { [lq.sortBy]: lq.order } as FindOptionsOrder<JurnalHarian>,
            skip: (lq.page - 1) * lq.limit,
            take: lq.limit,
        });

        return { data, total };
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

    async getUserIdFromJurnalId(idJurnal: number) {
        const jurnal = await this.repo.findOneBy({ id: idJurnal });
        return jurnal?.pesertaId;
    }
}