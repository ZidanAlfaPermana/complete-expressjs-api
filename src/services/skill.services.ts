import { SkillRepository } from "../repositories";
import {ConflictError} from "../utils/AppError";

interface SkillBody {
    nama: string;
}

export class SkillService {
    private skillRepo = new SkillRepository();

    async getSemuaSkill() {
        return this.skillRepo.findAll();
    }

    async getSkillById(id: number) {
        return this.skillRepo.findById(id);
    }

    async buatSkill(data: SkillBody) {
        const isDuplikat = await this.skillRepo.findByNama(data.nama);
        if (isDuplikat) {
            throw new ConflictError(`Skill dengan nama ${data.nama} sudah ada`);
        }

        return this.skillRepo.save(data);
    }

    async updateSkill(id: number, data: SkillBody) {
        const skill = await this.skillRepo.findById(id);
        if (!skill) return null;

        const isDuplikat = await this.skillRepo.findByNama(data.nama);
        if (isDuplikat && isDuplikat.id !== id) {
            throw new ConflictError(`Skill dengan nama ${data.nama} sudah ada`);
        }

        return this.skillRepo.save({
            ...skill,
            ...data
        });
    }

    async hapusSkill(id: number) {
        const result = await this.skillRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }
}