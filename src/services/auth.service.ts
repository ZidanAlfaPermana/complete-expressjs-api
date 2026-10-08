import { AppDataSource } from "../config/database.config";
import {Peserta} from "../entities";
import { RefreshTokenRepository } from "../repositories";
import { hashPassword, cekPassword } from "../utils/password";
import {buatAccessToken, buatRefreshToken, verifikasiRefreshToken} from "../utils/jwt";
import { ConflictError, UnauthorizedError } from "../utils/AppError";

const repo = AppDataSource.getRepository(Peserta);
const repoAuth = new RefreshTokenRepository();

interface RegisterInput {
    nama: string;
    sekolah: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export async function login(data: LoginInput) {
    const peserta = await repo
  .createQueryBuilder("p")
  .addSelect("p.password")
  .where("p.email = :email", { email: data.email })
  .getOne();

    if (!peserta) {
        throw new UnauthorizedError("Email atau password salah");
    }

    const passwordCocok = await cekPassword(data.password, peserta.password);
    if (!passwordCocok) {
        throw new UnauthorizedError("Email atau password salah");
    }

    const accessToken = buatAccessToken({ id: peserta.id, email: peserta.email, role: peserta.role });
    const refreshToken = buatRefreshToken({ id: peserta.id, email: peserta.email, role: peserta.role });

    await repoAuth.save({
        token: refreshToken,
        peserta,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const { password, ...pesertaAman } = peserta;
    return { accessToken, refreshToken, peserta: pesertaAman };
}

export async function register(data: RegisterInput) {
    const sudahAda = await repo
  .createQueryBuilder("p")
  .addSelect("p.password")
  .where("p.email = :email", { email: data.email })
  .getOne();
    if (sudahAda) {
        throw new ConflictError("Email sudah terdaftar");
    }

    const passwordHash = await hashPassword(data.password);

    const peserta = repo.create({
        nama: data.nama,
        sekolah: data.sekolah,
        email: data.email,
        password: passwordHash,
        fase: 1,
        role: "peserta",
        skills: []
    });

    const tersimpan = await repo.save(peserta);
    const { password, ...aman } = tersimpan;

    return aman;
}

export async function refresh(refreshTokenInput: string) {
    const payload = verifikasiRefreshToken(refreshTokenInput);   // lempar error jika invalid

    const tersimpan = await repoAuth.findOneBy(refreshTokenInput);
    if (!tersimpan) {
        throw new UnauthorizedError("Refresh token tidak dikenali atau sudah dicabut");
    }

    const { id, email, role } = payload;
    const accessTokenBaru = buatAccessToken({ id, email, role });
    return { accessToken: accessTokenBaru };
}

export async function logout(refreshTokenInput: string) {
    await repoAuth.delete(refreshTokenInput);
}