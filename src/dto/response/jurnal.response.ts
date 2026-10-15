// src/dto/response/jurnal.response.ts
import { Expose, Type } from "class-transformer";
import { PesertaResponseDto } from "./peserta.response";
import { MentorResponseDto } from "./mentor.response";
import { Status, StatusReview } from "../../entities/Jurnal.entity";

export class LampiranResponseDto {
    @Expose() url!: string;
    @Expose() keterangan?: string;
}

export class JurnalResponseDto {
    @Expose() id!: number;
    @Expose() pesertaId!: number;
    @Expose() kegiatan!: string;
    @Expose() hambatan?: string;
    @Expose() rencanaBesok?: string;
    @Expose() linkCommit?: string;
    @Expose() statusReview!: StatusReview;
    @Expose() status!: Status;
    @Expose() catatanMentor?: string | null;

    @Expose()
    @Type(() => LampiranResponseDto)   // ← ini yang kurang
    lampiran!: LampiranResponseDto[] | null;

    @Expose() reviewerId?: number;
    @Expose() createdAt!: Date;

    @Expose()
    @Type(() => PesertaResponseDto)
    peserta?: PesertaResponseDto;

    @Expose()
    @Type(() => MentorResponseDto)
    reviewer?: MentorResponseDto;
}