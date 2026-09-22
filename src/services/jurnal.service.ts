import { Jurnal } from "../types";
import { dataPeserta, dataJurnal } from "../data/dummy";

interface JurnalFilter {
    idPeserta?: number;
    status?: "belum" | "selesai" | "proses";
    limit?: number;
}

interface JurnalBody {
    idPeserta: number;
    status: "belum" | "selesai" | "proses";
    kegiatan: string;
    hambatan?: string;
    rencanaBesok: string;
    linkCommit?: string;
    review: "sudah" | "belum";
}

export class JurnalService {
    static async getSemuaJurnal(filters: JurnalFilter): Promise<Jurnal[]> {
        let hasil = [...dataJurnal];

        if (filters.idPeserta) {
            hasil = hasil.filter((j) => j.idPeserta === filters.idPeserta);
        }

        if (filters.status) {
            hasil = hasil.filter((j) => j.status === filters.status);
        }

        const limit = filters.limit ?? 20;
        return hasil.slice(0, limit);
    }

    static async getTotalJurnal(): Promise<string> {
        return String(dataJurnal.length);
    }

    static async getTotalJurnalBelumReview(): Promise<string> {
        return String(dataJurnal.filter(d => d.review == "belum").length);
    }

    static async updateStatusReview(id: number, review: "sudah" | "belum"): Promise<Jurnal | null> {
        const index = dataJurnal.findIndex((j) => j.id === id);

        if (index === -1) {
            return null;
        }

        dataJurnal[index].review = review;
        return dataJurnal[index];
    }

    static async getRataRataJurnalPeserta(): Promise<string> {
        const totalJurnal = dataJurnal.length;
        const totalPeserta = dataPeserta.length;
        if (totalPeserta === 0) return "0";

        const rataRata = totalJurnal / totalPeserta;

        return rataRata.toFixed(2);
    }

    static async getJurnalById(id: number): Promise<Jurnal | null> {
        const jurnal = dataJurnal.find((j) => j.id === id);
        return jurnal || null;
    }

    static async getJurnalByPesertaId(idPeserta: number): Promise<Jurnal[]> {
        const jurnal = dataJurnal.filter((j) => j.idPeserta === idPeserta);
        return jurnal;
    }

    static async buatJurnal(data: JurnalBody): Promise<Jurnal> {
        const pesertaExists = dataPeserta.find((p) => p.id === data.idPeserta);
        if (!pesertaExists) {
            throw new Error(`Peserta dengan id ${data.idPeserta} tidak ditemukan`);
        }

        const newId = Math.max(...dataJurnal.map((j) => j.id), 0) + 1;

        const jurnalBaru: Jurnal = {
            id: newId,
            idPeserta: data.idPeserta,
            status: data.status,
            kegiatan: data.kegiatan,
            hambatan: data.hambatan || "",
            rencanaBesok: data.rencanaBesok,
            linkCommit: data.linkCommit,
            review: data.review
        };

        dataJurnal.push(jurnalBaru);
        return jurnalBaru;
    }

    static async updateJurnal(id: number, data: JurnalBody): Promise<Jurnal | null> {
        const index = dataJurnal.findIndex((j) => j.id === id);

        if (index === -1) {
            return null;
        }

        const pesertaExists = dataPeserta.find((p) => p.id === data.idPeserta);
        if (!pesertaExists) {
            throw new Error(`Peserta dengan id ${data.idPeserta} tidak ditemukan`);
        }

        const jurnalUpdated: Jurnal = {
            ...dataJurnal[index],
            ...data,
            id
        };

        dataJurnal[index] = jurnalUpdated;
        return jurnalUpdated;
    }

    static async hapusJurnal(id: number): Promise<boolean> {
        const index = dataJurnal.findIndex((j) => j.id === id);

        if (index === -1) {
            return false;
        }

        dataJurnal.splice(index, 1);
        return true;
    }
}