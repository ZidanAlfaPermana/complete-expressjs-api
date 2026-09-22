import {Jurnal} from "../types";
import {Repository} from "./base.repository";

export class JurnalRepository extends Repository<Jurnal> {
    findByStatus(status: string): Jurnal[] {
        return this.findAll().filter((item) => item.status === status);
    }

    findByIdPeserta(idPeserta: number): Jurnal[] {
        return this.findAll().filter((item) => item.idPeserta === idPeserta);
    }
}