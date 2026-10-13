import { IsArray, IsOptional, IsString, Matches } from "class-validator";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMAL_3_KARAKTER = /^\s*\S[\s\S]+\S\s*$/;

export class MentorDto {
    @IsString({ message: "Nama mentor wajib diisi, minimal 3 karakter" })
    @Matches(MINIMAL_3_KARAKTER, { message: "Nama mentor wajib diisi, minimal 3 karakter" })
    nama!: string;

    @IsString({ message: "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)" })
    @Matches(EMAIL_REGEX, { message: "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)" })
    email!: string;

    @IsOptional()
    @IsArray({ message: "Keahlian harus berupa array" })
    keahlian?: unknown[];
}