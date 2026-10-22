import { Repository } from "typeorm";
import { Mentor } from "../entities";
import {NotFoundError} from "../utils/AppError";

export interface MentorBody {
    nama: string;
    email: string;
    keahlian?: string | string[];
}

export class MentorService {
    constructor(private readonly mentorRepo: Repository<Mentor>) {}

    getSemuaMentor() {
        return this.mentorRepo.find();
    }

    async getMentorById(id: number) {
        const mentor = await this.mentorRepo.findOneBy({ id });
        if (!mentor) throw new NotFoundError("Mentor");
        return mentor;
    }

    buatMentor(data: MentorBody) {
        return this.mentorRepo.save({
            nama: data.nama,
            email: data.email,
            keahlian: this.keArray(data.keahlian) ?? [],
        });
    }

    async updateMentor(id: number, data: MentorBody) {
        const mentor = await this.getMentorById(id);

        return this.mentorRepo.save({
            ...mentor,
            nama: data.nama,
            email: data.email,
            keahlian: this.keArray(data.keahlian) ?? mentor.keahlian,
        });
    }

    async hapusMentor(id: number) {
        const result = await this.mentorRepo.delete(id);
        if (!result.affected) throw new NotFoundError(`Mentor dengan id ${id} tidak ditemukan`);
    }

    private keArray(keahlian?: string | string[]) {
        if (keahlian === undefined) return undefined;
        if (Array.isArray(keahlian)) return keahlian;
        return keahlian ? [keahlian] : [];
    }
}