import { MentorRepository } from "../repositories";

interface MentorBody {
    nama: string;
    email: string;
    spesialisasi?: string;
}

export class MentorService {
    private mentorRepo = new MentorRepository();

    async getSemuaMentor() {
        return this.mentorRepo.findAll();
    }

    async getMentorById(id: number) {
        return this.mentorRepo.findById(id);
    }

    async buatMentor(data: MentorBody) {
        return this.mentorRepo.save(data);
    }

    async updateMentor(id: number, data: MentorBody) {
        const mentor = await this.mentorRepo.findById(id);
        if (!mentor) return null;

        return this.mentorRepo.save({
            ...mentor,
            ...data
        });
    }

    async hapusMentor(id: number) {
        const result = await this.mentorRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }
}