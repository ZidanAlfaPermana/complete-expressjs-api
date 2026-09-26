import { AppDataSource } from "../config/database.config";
import { Skill } from "../entities";
import {In} from "typeorm";

export class SkillRepository {
    private repo = AppDataSource.getRepository(Skill);

    async findAll() {
        return this.repo.find();
    }

    async findById(id: number) {
        return this.repo.findOneBy({ id });
    }

    async findByIds(ids: number[]) {
        return this.repo.find({
            where: {
                id: In(ids)
            }
        });
    }

    async findByNama(nama: string) {
        return this.repo.findOneBy({ nama });
    }

    async save(data: Partial<Skill>) {
        return this.repo.save(data);
    }

    async delete(id: number) {
        return this.repo.delete(id);
    }
}