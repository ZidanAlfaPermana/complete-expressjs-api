import { AppDataSource } from "../config/database.config";
import { Peserta as PesertaEntity } from "../entities";
import {FindOptionsOrder, FindOptionsWhere, ILike} from "typeorm";
import {escapeLike, ListQuery} from "../utils/pagination";

export interface PesertaFilter {
    sekolah?: string;
    fase?: number;
}

export class PesertaRepository {
    private repo = AppDataSource.getRepository(PesertaEntity);

    async findWithFilters(where: FindOptionsWhere<PesertaEntity>, limit: number) {
        return this.repo.find({ where, take: limit });
    }

    async count() {
        return this.repo.count();
    }

    async findById(id: number) {
        return this.repo.findOneBy({ id });
    }

    async findByEmail(email: string) {
        return this.repo.findOneBy({ email });
    }

    async findByNamaAndSekolah(nama: string, sekolah: string) {
        return this.repo.findOneBy({ nama, sekolah });
    }

    async getPesertaDenganJurnal(id: number) {
        return this.repo.findOne({
            where: { id },
            relations: { jurnalList: true },
        });
    }

    async save(data: Partial<PesertaEntity>) {
        return this.repo.save(data);
    }

    async ubahSebagian(id: number, body: Record<string, unknown>) {
        const peserta = await this.repo.findOneBy({ id });
        if (!peserta) return null;

        const { nama, sekolah, telepon } = body;
        const perubahan = Object.fromEntries(
            Object.entries({ nama, sekolah, telepon }).filter(([, nilai]) => nilai !== undefined)
        );

        this.repo.merge(peserta, perubahan);
        return this.repo.save(peserta);
    }

    async ubahOlehMentor(id: number, perubahan: Partial<PesertaEntity>) {
        const peserta = await this.repo.findOneBy({ id });
        if (!peserta) return null;

        this.repo.merge(peserta, perubahan);
        return this.repo.save(peserta);
    }

    async delete(id: number) {
        return this.repo.delete(id);
    }

    async findPaginated(lq: ListQuery, filter: PesertaFilter) {
        const dasar: FindOptionsWhere<PesertaEntity> = {};
        if (filter.sekolah) dasar.sekolah = filter.sekolah;
        if (filter.fase) dasar.fase = filter.fase;

        const where: FindOptionsWhere<PesertaEntity> | FindOptionsWhere<PesertaEntity>[] = lq.q
            ? [
                { ...dasar, nama: ILike(`%${escapeLike(lq.q)}%`) },
                { ...dasar, email: ILike(`%${escapeLike(lq.q)}%`) },
            ]
            : dasar;

        const [data, total] = await this.repo.findAndCount({
            where,
            order: { [lq.sortBy]: lq.order } as FindOptionsOrder<PesertaEntity>,
            skip: (lq.page - 1) * lq.limit,
            take: lq.limit,
        });

        return { data, total };
    }
}