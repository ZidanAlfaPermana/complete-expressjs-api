import {IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Matches, Min, ValidateIf} from "class-validator";
import {ListQueryDto} from "./common.dto";
import {Type} from "class-transformer";
import {KeBoolean} from "./decorators/transform";

const MINIMAL_10_KATA = /^\s*(\S+\s+){9,}\S+\s*$/;
export const SORT_JURNAL = ["createdAt", "review"] as const;

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

export class ListJurnalQueryDto extends ListQueryDto {
    @IsOptional()
    @IsIn(SORT_JURNAL)
    sortBy: (typeof SORT_JURNAL)[number] = "createdAt";

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pesertaId?: number;

    @IsOptional()
    @IsIn(["belum", "sudah"], { message: "statusReview harus belum atau sudah" })
    statusReview?: "belum" | "sudah";

    @IsOptional()
    @IsDateString({}, { message: "from harus berformat tanggal ISO, contoh 2026-09-01" })
    from?: string;

    @IsOptional()
    @IsDateString({}, { message: "to harus berformat tanggal ISO, contoh 2026-09-30" })
    to?: string;

    @IsOptional()
    @KeBoolean()
    @IsBoolean({ message: "belumDireview harus true atau false" })
    belumDireview?: boolean;
}