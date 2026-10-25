import { PesertaRepository, RefreshTokenRepository } from "../repositories";
import { hashPassword, cekPassword } from "../utils/password";
import { buatAccessToken, buatRefreshToken, verifikasiRefreshToken } from "../utils/jwt";
import { ConflictError, UnauthorizedError } from "../utils/AppError";

interface RegisterInput {
    nama: string;
    sekolah: string;
    email: string;
    password: string;
    konfirmasiPassword: string;
}

interface LoginInput {
    email: string;
    password: string;
}

const MASA_BERLAKU_REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000 /*6 * 24 * 60 * 60 * 1000*/;

export class AuthService {
    constructor(
        private readonly pesertaRepo: PesertaRepository,
        private readonly refreshTokenRepo: RefreshTokenRepository
    ) {}

    async login(data: LoginInput) {
        const peserta = await this.pesertaRepo.cariDenganPassword(data.email);
        if (!peserta) /*throw this.kredensialSalah();*/ throw new UnauthorizedError("Email tidak ditemukan");

        const passwordCocok = await cekPassword(data.password, peserta.password);
        if (!passwordCocok) throw this.kredensialSalah();

        const payload = { id: peserta.id, email: peserta.email, role: peserta.role };
        const accessToken = buatAccessToken(payload);
        const refreshToken = buatRefreshToken(payload);

        await this.refreshTokenRepo.save({
            token: refreshToken,
            peserta,
            expiresAt: new Date(Date.now() + MASA_BERLAKU_REFRESH_TOKEN_MS),
        });

        const { password, ...pesertaAman } = peserta;
        return { accessToken, refreshToken, peserta: pesertaAman };
    }

    async register(data: RegisterInput) {
        const sudahAda = await this.pesertaRepo.findByEmail(data.email);
        if (sudahAda) throw new ConflictError("Email sudah terdaftar");

        const tersimpan = await this.pesertaRepo.save({
            nama: data.nama,
            sekolah: data.sekolah,
            email: data.email,
            password: await hashPassword(data.password), /*data.password,*/
            fase: 1,
            role: "peserta",
            skills: [],
        });

        const { password, ...aman } = tersimpan;
        return aman;
    }

    async refresh(refreshTokenInput: string) {
        const { id, email, role } = verifikasiRefreshToken(refreshTokenInput);

        const tersimpan = await this.refreshTokenRepo.findOneBy(refreshTokenInput);
        if (!tersimpan) {
            throw new UnauthorizedError("Refresh token tidak dikenali atau sudah dicabut");
        }

        return { accessToken: buatAccessToken({ id, email, role }) };
    }

    async logout(refreshTokenInput: string) {
        await this.refreshTokenRepo.delete(refreshTokenInput);
    }

    private kredensialSalah() {
        return new UnauthorizedError("Email atau password salah");
    }
}