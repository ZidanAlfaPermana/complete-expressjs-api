import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    IsString, IsUrl,
    Matches,
    MaxLength,
    Min, MinLength,
    ValidateIf, ValidateNested
} from "class-validator";
import {ListQueryDto} from "./common.dto";
import {Type} from "class-transformer";
import {KeBoolean, Trim} from "./decorators/transform";

const MINIMAL_10_KATA = /^\s*(\S+\s+){9,}\S+\s*$/;
export const SORT_JURNAL = ["createdAt", "statusReview"] as const;

export class CreateJurnalDto {
    @Trim()
    @IsString({ message: "Kegiatan harus berupa teks" })
    @MinLength(10, { message: "Kegiatan minimal 10 karakter" })
    @MaxLength(2000, { message: "Kegiatan maksimal 2000 karakter" })
    kegiatan!: string;

    @IsOptional()
    @Trim()
    @IsString({ message: "Hambatan harus berupa teks" })
    @MaxLength(2000, { message: "Hambatan maksimal 2000 karakter" })
    hambatan?: string;

    @Trim()
    @IsString({ message: "Rencana besok harus berupa teks" })
    @MinLength(5, { message: "Rencana besok minimal 5 karakter" })
    @MaxLength(2000, { message: "Rencana besok maksimal 2000 karakter" })
    rencanaBesok!: string;

    @IsOptional()
    @IsUrl({}, { message: "Link commit harus berupa URL yang valid" })
    linkCommit?: string;

    @IsOptional()
    @IsArray({ message: "lampiran harus berupa array" })
    @ArrayMaxSize(5, { message: "Lampiran maksimal 5 item" })
    @ValidateNested({ each: true })   // validasi SETIAP elemen array
    @Type(() => LampiranDto)           // wajib: beritahu class-transformer tipe elemennya
    lampiran?: LampiranDto[];
}

export class LampiranDto {
    @IsUrl({}, { message: "URL lampiran tidak valid" })
    url!: string;

    @IsOptional()
    @IsString({ message: "keterangan harus berupa teks" })
    @MaxLength(200, { message: "keterangan maksimal 200 karakter" })
    keterangan?: string;
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

// src/dto/jurnal.dto.ts
export class ReviewJurnalDto {
    @IsIn(["belum", "sudah"], { message: "statusReview harus belum atau sudah" })
    statusReview!: "belum" | "sudah";

    // Catatan WAJIB hanya kalau jurnal ditandai "sudah" direview
    @ValidateIf((o: ReviewJurnalDto) => o.statusReview === "sudah")
    @IsString({ message: "Catatan wajib diisi saat jurnal ditandai sudah direview" })
    @MinLength(5, { message: "Catatan minimal 5 karakter" })
    catatan?: string;
}

export class UpdateJurnalDto {
    @IsOptional() @Trim() @IsString() @MinLength(10) @MaxLength(2000)
    kegiatan?: string;

    @IsOptional() @Trim() @IsString() @MaxLength(2000)
    hambatan?: string;

    @IsOptional() @IsUrl({}, { message: "Link commit harus berupa URL yang valid" })
    linkCommit?: string;

    @IsOptional() @Trim() @IsString() @MinLength(5) @MaxLength(2000)
    rencanaBesok?: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(5, { message: "Lampiran maksimal 5 item" })
    @ValidateNested({ each: true })
    @Type(() => LampiranDto)
    lampiran?: LampiranDto[];
}