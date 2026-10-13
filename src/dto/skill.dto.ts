import { IsString, Matches } from "class-validator";

const MINIMAL_2_KARAKTER = /^\s*\S[\s\S]*\S\s*$/;

export class SkillDto {
    @IsString({ message: "Nama skill wajib diisi, minimal 2 karakter" })
    @Matches(MINIMAL_2_KARAKTER, { message: "Nama skill wajib diisi, minimal 2 karakter" })
    nama!: string;
}