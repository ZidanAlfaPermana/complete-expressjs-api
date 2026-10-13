import { IsIn, IsInt, IsOptional, IsString, Matches, ValidateIf } from "class-validator";

const MINIMAL_10_KATA = /^\s*(\S+\s+){9,}\S+\s*$/;

export class JurnalDto {
    @IsInt({ message: "ID peserta wajib diisi dan harus berupa angka" })
    pesertaId!: number;

    @IsIn(["selesai", "proses", "belum"], {
        message: "Status wajib diisi, dengan memilih selesai, proses, atau belum",
    })
    status!: "selesai" | "proses" | "belum";

    @IsString({ message: "Kegiatan wajib diisi, minimal 10 kata" })
    @Matches(MINIMAL_10_KATA, { message: "Kegiatan wajib diisi, minimal 10 kata" })
    kegiatan!: string;

    @IsOptional()
    @IsString({ message: "Hambatan harus berupa teks" })
    hambatan?: string;

    @IsString({ message: "Rencana besok wajib diisi, minimal 10 kata" })
    @Matches(MINIMAL_10_KATA, { message: "Rencana besok wajib diisi, minimal 10 kata" })
    rencanaBesok!: string;

    @ValidateIf((o: JurnalDto) => o.linkCommit !== undefined && o.linkCommit !== "")
    @IsString({ message: "Link commit harus valid dan diawali dengan https://github.com/" })
    @Matches(/^https:\/\/github\.com\//, {
        message: "Link commit harus valid dan diawali dengan https://github.com/",
    })
    linkCommit?: string;

    @IsIn(["sudah", "belum"], {
        message: "Status Review wajib diisi, dengan memilih sudah, atau belum",
    })
    review!: "sudah" | "belum";

    @IsInt({ message: "ID reviewer (mentor) wajib diisi dan harus berupa angka" })
    reviewerId!: number;
}