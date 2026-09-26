import { AppDataSource } from "../config/database.config";
import { Mentor } from "../entities";

export class MentorRepository {
    private repo = AppDataSource.getRepository(Mentor);

    async findAll() {
        return this.repo.find();
    }

    async findById(id: number) {
        return this.repo.findOneBy({ id });
    }

    async save(data: Partial<Mentor>) {
        return this.repo.save(data);
    }

    async delete(id: number) {
        return this.repo.delete(id);
    }
}