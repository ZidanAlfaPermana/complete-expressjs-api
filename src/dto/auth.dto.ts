// src/dto/auth.dto.ts
import {
    IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength,
} from "class-validator";
import {KeHurufKecil, Trim} from "./decorators/transform";
import {Sama} from "./decorators/sama";

export class RegisterDto {
    @Trim()
    @IsString({ message: "Nama harus berupa teks" })
    @MinLength(3, { message: "Nama minimal 3 karakter" })
    @MaxLength(100, { message: "Nama maksimal 100 karakter" })
    nama!: string;

    @IsString({ message: "Sekolah harus berupa teks" })
    @MinLength(3, { message: "Sekolah minimal 3 karakter" })
    @MaxLength(100, { message: "Sekolah maksimal 100 karakter" })
    sekolah!: string;

    @Trim()
    @KeHurufKecil()
    @IsEmail({}, { message: "Format email tidak valid" })
    email!: string;

    @IsString({ message: "Password harus berupa teks" })
    @MinLength(8, { message: "Password minimal 8 karakter" })
    /*
    * soal 6, minggu 15, hari selasa
    * hasil test jika saja comment/hilangkan maxlength password, terdapat satu test yang failed yaitu
    * pada RegisterDto bagian RegisterDto › menolak: password lebih dari 72 karakter
    * */
    @MaxLength(72, { message: "Password maksimal 72 karakter" })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
        message: "Password harus mengandung huruf dan angka",
    })
    password!: string;

    @IsString({ message: "Konfirmasi password harus berupa teks" })
    @Sama("password", { message: "Konfirmasi password tidak cocok" })
    konfirmasiPassword!: string;
}

export class LoginDto {
    @IsEmail({}, { message: "Format email tidak valid" })
    email!: string;

    // Login TIDAK memakai aturan kekuatan password: akun lama tidak boleh terkunci,
    // dan kita tidak ingin membocorkan aturan password ke penyerang.
    @IsString({ message: "Password harus berupa teks" })
    @IsNotEmpty({ message: "Password wajib diisi" })
    password!: string;
}

/*
export class RefreshTokenDto {
    @IsNotEmpty({ message: "Token Refresh harus diisi"})
}*/
