import { AppDataSource } from "../config/database.config";
import { Peserta as PesertaEntity } from "../entities/Peserta.entity";
import { FindOptionsWhere } from "typeorm";

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

    async delete(id: number) {
        return this.repo.delete(id);
    }
}