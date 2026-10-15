// src/dto/response/peserta.response.ts
import { Expose } from "class-transformer";

export class PesertaResponseDto {
    @Expose() id!: number;
    @Expose() nama!: string;
    @Expose() sekolah!: string;
    @Expose() email!: string;
    @Expose() fase!: number;
    @Expose() status!: string;
    @Expose() role!: string;
    @Expose() telepon?: string;
    @Expose() createdAt!: Date;
    // password TIDAK diberi @Expose, jadi tidak pernah ikut keluar
}