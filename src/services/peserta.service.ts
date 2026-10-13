import { PesertaRepository } from "../repositories";
import {Skill, Peserta} from "../entities";
import {hashPassword} from "../utils/password";
import {ListQuery} from "../utils/pagination";
import {PesertaFilter} from "../repositories/peserta.repository";
import {ConflictError, NotFoundError} from "../utils/AppError";
import {UpdateProfilDto} from "../dto/peserta.dto";
import {ValidationError} from "../utils/AppError";

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

function hanyaYangDiisi<T extends object>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, nilai]) => nilai !== undefined)
    ) as Partial<T>;
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
            throw new ConflictError(`Peserta bernama ${data.nama} dari sekolah ${data.sekolah} sudah terdaftar!`);
        }

        if (isEmailDuplikat) {
            throw new ConflictError(`Email sudah terdaftar, coba email yang lain`);
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

    async updatePeserta(id: number, data: Partial<PesertaBody>) {
        const peserta = await this.pesertaRepo.findById(id);
        if (!peserta) return null;

        const { nama, email, password, status, sekolah, fase, role, skillIds } = data;

        const namaFinal = nama ?? peserta.nama;
        const sekolahFinal = sekolah ?? peserta.sekolah;
        const duplikat = await this.pesertaRepo.findByNamaAndSekolah(namaFinal, sekolahFinal);
        if (duplikat && duplikat.id !== id) {
            throw new ConflictError(`Peserta bernama ${namaFinal} dari sekolah ${sekolahFinal} sudah terdaftar!`);
        }

        const perubahan: Partial<Peserta> = Object.fromEntries(
            Object.entries({ nama, email, status, sekolah, fase, role }).filter(([, v]) => v !== undefined)
        );

        if (password) perubahan.password = await hashPassword(password);
        if (skillIds) perubahan.skills = skillIds.map(skillId => ({ id: skillId } as Skill));

        return this.pesertaRepo.ubahOlehMentor(id, perubahan);
    }

    async updatePesertaBeberapa(id: number, data: Partial<PesertaBody>) {
        const peserta = await this.pesertaRepo.findById(id);
        if (!peserta) return null;

        const { nama, email, password, status, sekolah, fase, skillIds } = data;

        const namaFinal = nama ?? peserta.nama;
        const sekolahFinal = sekolah ?? peserta.sekolah;
        const duplikat = await this.pesertaRepo.findByNamaAndSekolah(namaFinal, sekolahFinal);
        if (duplikat && duplikat.id !== id) {
            throw new ConflictError(`Peserta bernama ${namaFinal} dari sekolah ${sekolahFinal} sudah terdaftar!`);
        }

        const perubahan: Partial<Peserta> = Object.fromEntries(
            Object.entries({ nama, email, status, sekolah, fase }).filter(([, v]) => v !== undefined)
        );

        if (password) perubahan.password = await hashPassword(password);
        if (skillIds) perubahan.skills = skillIds.map(skillId => ({ id: skillId } as Skill));

        return this.pesertaRepo.ubahOlehMentor(id, perubahan);
    }

    async hapusPeserta(id: number) {
        const result = await this.pesertaRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async ubahProfil(id: number, data: UpdateProfilDto) {
        const peserta = await this.pesertaRepo.findById(id);
        if (!peserta) throw new NotFoundError("Peserta");

        const perubahan = hanyaYangDiisi(data);
        if (Object.keys(perubahan).length === 0) {
            throw new ValidationError([{ field: "body", pesan: "Minimal satu field harus diisi" }]);
        }

        return this.pesertaRepo.ubahOlehMentor(id, perubahan);
    }
}