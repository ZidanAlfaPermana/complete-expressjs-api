import { PesertaRepository } from "../repositories";
import {Skill} from "../entities";

interface PesertaFilter {
    sekolah?: string;
    fase?: number;
    limit?: number;
}

interface PesertaBody {
    nama: string;
    email: string;
    sekolah: string;
    fase: number;
    skillIds?: number[];
}

export class PesertaService {
    private pesertaRepo = new PesertaRepository();

    async getSemuaPeserta(filters: PesertaFilter) {
        const where: any = {};

        if (filters.sekolah) where.sekolah = filters.sekolah;
        if (filters.fase) where.fase = filters.fase;

        const limit = filters.limit ?? 20;
        return this.pesertaRepo.findWithFilters(where, limit);
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
        const isDuplikat = await this.pesertaRepo.findByNamaAndSekolah(data.nama, data.sekolah);

        if (isDuplikat) {
            throw new Error(`Peserta bernama ${data.nama} dari sekolah ${data.sekolah} sudah terdaftar!`);
        }

        const skills = data.skillIds ? data.skillIds.map(id => ({ id } as Skill)) : [];

        return this.pesertaRepo.save({
            nama: data.nama,
            email: data.email,
            sekolah: data.sekolah,
            fase: data.fase,
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

        return this.pesertaRepo.save({
            ...peserta,
            nama: data.nama,
            email: data.email,
            sekolah: data.sekolah,
            fase: data.fase,
            skills: skills
        });
    }

    async hapusPeserta(id: number) {
        const result = await this.pesertaRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }
}