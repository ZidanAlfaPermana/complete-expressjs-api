import { PesertaRepository } from "../repositories";
import {Skill} from "../entities";
import {hashPassword} from "../utils/password";
import {ListQuery} from "../utils/pagination";
import {PesertaFilter} from "../repositories/peserta.repository";


interface PesertaBody {
    nama: string;
    email: string;
    password: string;
    status: "aktif" | "berhenti" | "lulus";
    sekolah: string;
    fase: number;
    role: 'peserta' | 'mentor';
    skillIds?: number[];
}

export const SORT_PESERTA = ["nama", "fase", "createdAt"] as const;

export class PesertaService {
    private pesertaRepo = new PesertaRepository();

    async getSemuaPeserta(lq: ListQuery, filter: PesertaFilter) {
        return this.pesertaRepo.findPaginated(lq, filter);
    }

    async getTotalPeserta() {
        const total = await this.pesertaRepo.count();
        return String(total);
    }

    async getPesertaById(id: number) {
        return this.pesertaRepo.findById(id);
    }

    async getPesertaDenganJurnal(id: number) {
        return this.pesertaRepo.getPesertaDenganJurnal(id)
    }

    async buatPeserta(data: PesertaBody) {
        const isNamaDuplikat = await this.pesertaRepo.findByNamaAndSekolah(data.nama, data.sekolah);
        const isEmailDuplikat = await this.pesertaRepo.findByEmail(data.email);

        if (isNamaDuplikat) {
            throw new Error(`Peserta bernama ${data.nama} dari sekolah ${data.sekolah} sudah terdaftar!`);
        }

        if (isEmailDuplikat) {
            throw new Error(`Email sudah terdaftar, coba email yang lain`);
        }

        const skills = data.skillIds ? data.skillIds.map(id => ({ id } as Skill)) : [];

        const hashed = await hashPassword(data.password);

        return this.pesertaRepo.save({
            nama: data.nama,
            email: data.email,
            password: hashed,
            sekolah: data.sekolah,
            fase: data.fase,
            role: data.role,
            skills: skills
        });
    }

    async updatePeserta(id: number, data: PesertaBody) {
        const peserta = await this.pesertaRepo.findById(id);
        if (!peserta) return null;

        const isDuplikat = await this.pesertaRepo.findByNamaAndSekolah(data.nama, data.sekolah);

        if (isDuplikat && isDuplikat.id !== id) {
            throw new Error(`Peserta bernama ${data.nama} dari sekolah ${data.sekolah} sudah terdaftar!`);
        }

        const skills = data.skillIds ? data.skillIds.map(skillId => ({ id: skillId } as Skill)) : peserta.skills;

        const hashed = await hashPassword(data.password);

        return this.pesertaRepo.save({
            ...peserta,
            nama: data.nama,
            email: data.email,
            password: hashed,
            sekolah: data.sekolah,
            fase: data.fase,
            role: data.role,
            skills: skills
        });
    }

    async hapusPeserta(id: number) {
        const result = await this.pesertaRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }
}