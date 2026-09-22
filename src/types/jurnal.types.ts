import { Entity } from "../types"
export interface Jurnal extends Entity {
    idPeserta: number;
    status: "belum" | "selesai" | "proses";
    kegiatan: string;
    hambatan: string;
    rencanaBesok: string;
    linkCommit?: string;
    review: "sudah" | "belum";
}