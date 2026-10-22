import { Repository } from "typeorm";
import { Skill } from "../entities";
import {ConflictError, NotFoundError} from "../utils/AppError";

export interface SkillBody {
    nama: string;
}

export class SkillService {
    constructor(private readonly skillRepo: Repository<Skill>) {}

    getSemuaSkill() {
        return this.skillRepo.find();
    }

    async getSkillById(id: number) {
        const skill = await this.skillRepo.findOneBy({ id });
        if (!skill) throw new NotFoundError("Skill");
        return skill;
    }

    async buatSkill(data: SkillBody) {
        await this.pastikanNamaBelumDipakai(data.nama);
        return this.skillRepo.save(data);
    }

    async updateSkill(id: number, data: SkillBody) {
        const skill = await this.getSkillById(id);
        await this.pastikanNamaBelumDipakai(data.nama, id);
        return this.skillRepo.save({ ...skill, ...data });
    }

    async hapusSkill(id: number) {
        const result = await this.skillRepo.delete(id);
        if (!result.affected) throw new NotFoundError(`Skill dengan id ${id} tidak ditemukan`);
    }

    private async pastikanNamaBelumDipakai(nama: string, kecualiId?: number) {
        const duplikat = await this.skillRepo.findOneBy({ nama });
        if (duplikat && duplikat.id !== kecualiId) {
            throw new ConflictError(`Skill dengan nama ${nama} sudah ada`);
        }
    }
}