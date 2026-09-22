import {Peserta} from "../types";
import {Repository} from "./base.repository";

export class PesertaRepository extends Repository<Peserta> {
    findBySekolah(sekolah: string): Peserta[] {
        return this.findAll().filter((item) => item.sekolah === sekolah);
    }

    findByFase(fase: number): Peserta[] {
        return this.findAll().filter((item) => item.fase === fase);
    }
}