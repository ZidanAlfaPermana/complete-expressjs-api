import {Entity} from "./entity.types";

export interface Peserta extends Entity {
    nama: string;
    sekolah: string;
    kelas: string;
    jurusan: string;
    fase: number;
}