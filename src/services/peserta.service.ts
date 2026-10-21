import { DeepPartial, FindOptionsOrder, FindOptionsWhere, Repository } from "typeorm";
import { Skill, Peserta } from "../entities";
import { PesertaFilter } from "../repositories/peserta.repository";
import { hashPassword } from "../utils/password";
import { ListQuery } from "../utils/pagination";
import { ConflictError, NotFoundError, ValidationError } from "../utils/AppError";
import { UpdateProfilDto } from "../dto/peserta.dto";

export interface PesertaBody {
    nama: string;
    email: string;
    password: string;
    status: "aktif" | "berhenti" | "lulus";
    sekolah: string;
    fase: number;
    role: "peserta" | "mentor";
    skillIds?: number[];
}

export const SORT_PESERTA = ["nama", "fase", "createdAt"] as const;

export function hanyaYangDiisi<T extends object>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, nilai]) => nilai !== undefined)
    ) as Partial<T>;
}

export class PesertaService {
    constructor(private readonly repo: Repository<Peserta>) {}

    async getSemuaPeserta(lq: ListQuery, filter: PesertaFilter) {
        const where: FindOptionsWhere<Peserta> = hanyaYangDiisi({
            status: filter.status,
            fase: filter.fase,
            sekolah: filter.sekolah,
            role: filter.role,
        }) as FindOptionsWhere<Peserta>;

        const sortBy = SORT_PESERTA.find(k => k === lq.sortBy) ?? "createdAt";
        const order = { [sortBy]: lq.order ?? "ASC" } as FindOptionsOrder<Peserta>;

        const [data, total] = await this.repo.findAndCount({
            where,
            order,
            skip: (lq.page - 1) * lq.limit,
            take: lq.limit,
        });

        return { data, total, page: lq.page, limit: lq.limit };
    }

    async getTotalPeserta() {
        return String(await this.repo.count());
    }

    async getPesertaById(id: number) {
        const peserta = await this.cariById(id);
        if (!peserta) throw new NotFoundError("Peserta");
        return peserta;
    }

    getPesertaDenganJurnal(id: number) {
        return this.repo.findOne({
            where: { id },
            relations: { jurnalList: true },
        });
    }

    async buatPeserta(data: PesertaBody) {
        const [duplikatNama, duplikatEmail] = await Promise.all([
            this.repo.findOneBy({ nama: data.nama, sekolah: data.sekolah }),
            this.repo.findOneBy({ email: data.email }),
        ]);

        if (duplikatNama) throw this.errorNamaDuplikat(data.nama, data.sekolah);
        if (duplikatEmail) throw new ConflictError("Email sudah terdaftar, coba email yang lain");

        return this.repo.save({
            nama: data.nama,
            email: data.email,
            password: await hashPassword(data.password),
            sekolah: data.sekolah,
            fase: data.fase,
            role: data.role,
            skills: this.toSkills(data.skillIds) ?? [],
        });
    }

    updatePeserta(id: number, data: Partial<PesertaBody>) {
        return this.terapkanUpdate(id, data);
    }

    updatePesertaBeberapa(id: number, data: Partial<PesertaBody>) {
        const { role: _role, ...tanpaRole } = data;
        return this.terapkanUpdate(id, tanpaRole);
    }

    async hapusPeserta(id: number) {
        const result = await this.repo.delete(id);
        if (!result.affected) throw new NotFoundError("Peserta");
    }

    async ubahProfil(id: number, data: UpdateProfilDto) {
        await this.getPesertaById(id);

        const perubahan = hanyaYangDiisi(data);
        if (Object.keys(perubahan).length === 0) {
            throw new ValidationError([{ field: "body", pesan: "Minimal satu field harus diisi" }]);
        }

        return this.simpanPerubahan(id, perubahan);
    }

    private cariById(id: number) {
        return this.repo.findOne({ where: { id }, relations: { skills: true } });
    }

    private async terapkanUpdate(id: number, data: Partial<PesertaBody>) {
        const peserta = await this.cariById(id);
        if (!peserta) return null;

        const { password, skillIds, ...field } = data;

        await this.pastikanTidakDuplikat(
            field.nama ?? peserta.nama,
            field.sekolah ?? peserta.sekolah,
            id
        );

        const perubahan: DeepPartial<Peserta> = hanyaYangDiisi(field);
        if (password) perubahan.password = await hashPassword(password);
        if (skillIds) perubahan.skills = this.toSkills(skillIds);

        return this.simpanPerubahan(id, perubahan);
    }

    private async simpanPerubahan(id: number, perubahan: DeepPartial<Peserta>) {
        await this.repo.save({ ...perubahan, id });
        return this.cariById(id);
    }

    private async pastikanTidakDuplikat(nama: string, sekolah: string, kecualiId: number) {
        const duplikat = await this.repo.findOneBy({ nama, sekolah });
        if (duplikat && duplikat.id !== kecualiId) {
            throw this.errorNamaDuplikat(nama, sekolah);
        }
    }

    private errorNamaDuplikat(nama: string, sekolah: string) {
        return new ConflictError(`Peserta bernama ${nama} dari sekolah ${sekolah} sudah terdaftar!`);
    }

    private toSkills(ids?: number[]) {
        return ids?.map(id => ({ id } as Skill));
    }
}