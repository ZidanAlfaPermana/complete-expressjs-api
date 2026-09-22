import { Peserta } from "../types";
import { dataPeserta } from "../data/dummy";

interface PesertaFilter {
    sekolah?: string;
    fase?: number;
    limit?: number;
}

interface PesertaBody {
    nama: string;
    kelas: string;
    jurusan: string;
    sekolah: string;
    fase: number;
}

export class PesertaService {
    static async getSemuaPeserta(filters: PesertaFilter): Promise<Peserta[]> {
        let hasil = [...dataPeserta];

        if (filters.sekolah) {
            hasil = hasil.filter((p) => p.sekolah === filters.sekolah);
        }

        if (filters.fase) {
            hasil = hasil.filter((p) => p.fase === filters.fase);
        }

        const limit = filters.limit ?? 20;
        return hasil.slice(0, limit);
    }

    static async getTotalPeserta(): Promise<string> {
        return String(dataPeserta.length);
    }

    static async getPesertaById(id: number): Promise<Peserta | null> {
        const peserta = dataPeserta.find((p) => p.id === id);
        return peserta || null;
    }

    static async buatPeserta(data: PesertaBody): Promise<Peserta> {
        const isDuplikat = dataPeserta.find(
            (p) => p.nama.toLowerCase() === data.nama.toLowerCase() && p.sekolah === data.sekolah
        );

        if (isDuplikat) {
            throw new Error(
                `Peserta bernama ${data.nama} dari sekolah ${data.sekolah} sudah terdaftar!`
            );
        }

        const newId = Math.max(...dataPeserta.map((p) => p.id), 0) + 1;

        const pesertaBaru: Peserta = {
            id: newId,
            nama: data.nama,
            kelas: data.kelas,
            jurusan: data.jurusan,
            sekolah: data.sekolah,
            fase: data.fase
        };

        dataPeserta.push(pesertaBaru);
        return pesertaBaru;
    }

    static async updatePeserta(id: number, data: PesertaBody): Promise<Peserta | null> {
        const index = dataPeserta.findIndex((p) => p.id === id);

        if (index === -1) {
            return null;
        }

        const isDuplikat = dataPeserta.find(
            (p) =>
                p.id !== id &&
                p.nama.toLowerCase() === data.nama.toLowerCase() &&
                p.sekolah === data.sekolah
        );

        if (isDuplikat) {
            throw new Error(
                `Peserta bernama ${data.nama} dari sekolah ${data.sekolah} sudah terdaftar!`
            );
        }

        const pesertaUpdated: Peserta = {
            ...dataPeserta[index],
            ...data,
            id
        };

        dataPeserta[index] = pesertaUpdated;
        return pesertaUpdated;
    }

    static async hapusPeserta(id: number): Promise<boolean> {
        const index = dataPeserta.findIndex((p) => p.id === id);

        if (index === -1) {
            return false;
        }

        dataPeserta.splice(index, 1);
        return true;
    }
}