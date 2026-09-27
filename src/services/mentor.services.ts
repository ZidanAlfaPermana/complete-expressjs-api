import { MentorRepository } from "../repositories";

interface MentorBody {
    nama: string;
    email: string;
    keahlian?: string | string[];
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
        const keahlianArray = Array.isArray(data.keahlian)
            ? data.keahlian
            : data.keahlian
                ? [data.keahlian]
                : [];

        return this.mentorRepo.save({
            nama: data.nama,
            email: data.email,
            keahlian: keahlianArray
        });
    }

    async updateMentor(id: number, data: MentorBody) {
        const mentor = await this.mentorRepo.findById(id);
        if (!mentor) return null;

        const keahlianArray = data.keahlian !== undefined
            ? (Array.isArray(data.keahlian) ? data.keahlian : [data.keahlian])
            : mentor.keahlian;

        return this.mentorRepo.save({
            ...mentor,
            nama: data.nama,
            email: data.email,
            keahlian: keahlianArray
        });
    }

    async hapusMentor(id: number) {
        const result = await this.mentorRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }
}