import {
    IsArray,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from "class-validator";
import {ListQueryDto} from "./common.dto";
import {Trim} from "./decorators/transform";
import {Type} from "class-transformer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMAL_3_KARAKTER = /^\s*\S[\s\S]+\S\s*$/;
export const SORT_PESERTA = ["nama", "fase", "createdAt"] as const;

export class PesertaDto {
    @IsString({ message: "Nama wajib diisi, minimal 3 karakter" })
    @Matches(MINIMAL_3_KARAKTER, { message: "Nama wajib diisi, minimal 3 karakter" })
    nama!: string;

    @IsNotEmpty({ message: "Sekolah wajib diisi" })
    @IsString({ message: "Sekolah wajib diisi" })
    sekolah!: string;

    @IsString({ message: "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)" })
    @Matches(EMAIL_REGEX, { message: "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)" })
    email!: string;

    @IsIn(["aktif", "lulus", "berhenti"], {
        message: "Status tidak valid. harus berisi aktif, lulus, atau berhenti",
    })
    status!: "aktif" | "lulus" | "berhenti";

    @IsNotEmpty({ message: "Telepon wajib diisi, tidak boleh kosong" })
    @IsString({ message: "Telepon wajib diisi, tidak boleh kosong" })
    telepon!: string;

    @Min(1, { message: "Fase wajib diisi, dan fase hanya ada fase 1 sampai 5" })
    @Max(5, { message: "Fase wajib diisi, dan fase hanya ada fase 1 sampai 5" })
    @IsInt({ message: "Fase wajib diisi, dan fase hanya ada fase 1 sampai 5" })
    fase!: number;

    @IsOptional()
    @IsInt({ each: true, message: "skillIds harus berupa array berisi angka" })
    @IsArray({ message: "skillIds harus berupa array berisi angka" })
    skillIds?: number[];

    @IsIn(["peserta", "mentor"], {
        message: "Role wajib diisi, dengan memilih role peserta atau mentor",
    })
    role!: "peserta" | "mentor";

    @MinLength(8, { message: "Password minimal 8 karakter" })
    @IsString({ message: "Password harus diisi, tidak boleh kosong" })
    password!: string;
}

export class UpdateProfilDto {
    @IsOptional()
    @IsString({ message: "Nama harus berupa teks" })
    @MinLength(3, { message: "Nama minimal 3 karakter" })
    @MaxLength(100, { message: "Nama maksimal 100 karakter" })
    nama?: string;

    @IsOptional()
    @IsString({ message: "Sekolah harus berupa teks" })
    @MinLength(3)
    @MaxLength(100)
    sekolah?: string;

    @IsOptional()
    @Matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, {
        message: "Format nomor telepon Indonesia tidak valid",
    })
    telepon?: string;
}

export class ListPesertaQueryDto extends ListQueryDto {
    @IsOptional()
    @IsIn(SORT_PESERTA, {
        message: `sortBy harus salah satu dari: ${SORT_PESERTA.join(", ")}`,
    })
    sortBy: (typeof SORT_PESERTA)[number] = "createdAt";

    @IsOptional()
    @Trim()
    @MaxLength(100, { message: "nama sekolah maksimal 100 kata"})
    @IsString({ message: "sekolah harus berupa teks" })
    sekolah?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "fase harus berupa bilangan bulat" })
    @Min(1, { message: "fase minimal 1" })
    @Max(5, { message: "fase maksimal 5" })
    fase?: number;
}