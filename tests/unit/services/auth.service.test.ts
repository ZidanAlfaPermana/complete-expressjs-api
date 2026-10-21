import { AuthService } from "../../../src/services/auth.service";
import type { PesertaRepository, RefreshTokenRepository } from "../../../src/repositories";
import { ConflictError, UnauthorizedError } from "../../../src/utils/AppError";
import { hashPassword, cekPassword } from "../../../src/utils/password";
import { buatAccessToken, buatRefreshToken, verifikasiRefreshToken } from "../../../src/utils/jwt";
import { buatMockRepo, MockRepo } from "../../helpers/mockRepo";

jest.mock("../../../src/utils/password");
jest.mock("../../../src/utils/jwt");

const mockHashPassword = hashPassword as jest.Mock;
const mockCekPassword = cekPassword as jest.Mock;
const mockBuatAccessToken = buatAccessToken as jest.Mock;
const mockBuatRefreshToken = buatRefreshToken as jest.Mock;
const mockVerifikasiRefreshToken = verifikasiRefreshToken as jest.Mock;

type MockPesertaRepo = MockRepo & Record<"findByEmail" | "cariDenganPassword", jest.Mock>;

function buatMockPesertaRepo(): MockPesertaRepo {
    return { ...buatMockRepo(), findByEmail: jest.fn(), cariDenganPassword: jest.fn() };
}

const NOW = 1_700_000_000_000;
const TUJUH_HARI_MS = 7 * 24 * 60 * 60 * 1000;

const inputRegister = {
    nama: "Budi",
    sekolah: "SMKN 1 Contoh",
    email: "budi@mail.com",
    password: "RahasiaAsli123",
    konfirmasiPassword: "RahasiaAsli123",
};

const inputLogin = { email: "budi@mail.com", password: "RahasiaAsli123" };

const pesertaDb = {
    id: 1,
    nama: "Budi",
    sekolah: "SMKN 1 Contoh",
    email: "budi@mail.com",
    password: "HASH_DI_DATABASE",
    fase: 1,
    role: "peserta",
};

describe("AuthService", () => {
    let pesertaRepo: MockPesertaRepo;
    let tokenRepo: MockRepo;
    let service: AuthService;

    function siapkanLoginBerhasil() {
        pesertaRepo.cariDenganPassword.mockResolvedValue({ ...pesertaDb });
        mockCekPassword.mockResolvedValue(true);
        mockBuatAccessToken.mockReturnValue("ACCESS_TOKEN");
        mockBuatRefreshToken.mockReturnValue("REFRESH_TOKEN");
    }

    beforeEach(() => {
        jest.resetAllMocks();
        pesertaRepo = buatMockPesertaRepo();
        tokenRepo = buatMockRepo();
        service = new AuthService(
            pesertaRepo as unknown as PesertaRepository,
            tokenRepo as unknown as RefreshTokenRepository
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("register", () => {
        it("menolak email yang sudah terdaftar dengan ConflictError dan tidak menyimpan apa pun", async () => {
            pesertaRepo.findByEmail.mockResolvedValue({ ...pesertaDb });

            await expect(service.register(inputRegister)).rejects.toBeInstanceOf(ConflictError);
            expect(pesertaRepo.save).not.toHaveBeenCalled();
        });

        it("menyimpan hash dari hashPassword, bukan password asli", async () => {
            pesertaRepo.findByEmail.mockResolvedValue(null);
            mockHashPassword.mockResolvedValue("HASH_RAHASIA");
            pesertaRepo.save.mockImplementation(async (data: object) => ({ id: 1, ...data }));

            await service.register(inputRegister);

            const disimpan = pesertaRepo.save.mock.calls[0][0];
            expect(disimpan.password).toBe("HASH_RAHASIA");
            expect(disimpan.password).not.toBe(inputRegister.password);
        });

        it("tidak mengembalikan properti password pada hasil", async () => {
            pesertaRepo.findByEmail.mockResolvedValue(null);
            mockHashPassword.mockResolvedValue("HASH_RAHASIA");
            pesertaRepo.save.mockImplementation(async (data: object) => ({ id: 1, ...data }));

            const hasil = await service.register(inputRegister);

            expect(hasil).not.toHaveProperty("password");
            expect(hasil).toMatchObject({ id: 1, email: inputRegister.email });
        });

        it("selalu mendaftarkan peserta baru dengan role peserta", async () => {
            pesertaRepo.findByEmail.mockResolvedValue(null);
            mockHashPassword.mockResolvedValue("HASH_RAHASIA");
            pesertaRepo.save.mockImplementation(async (data: object) => ({ id: 1, ...data }));

            await service.register(inputRegister);

            expect(pesertaRepo.save.mock.calls[0][0]).toMatchObject({ role: "peserta" });
        });
    });

    describe("login", () => {
        it("melempar UnauthorizedError jika email tidak ditemukan", async () => {
            pesertaRepo.cariDenganPassword.mockResolvedValue(null);

            await expect(service.login(inputLogin)).rejects.toBeInstanceOf(UnauthorizedError);
        });

        it("melempar UnauthorizedError jika password salah", async () => {
            pesertaRepo.cariDenganPassword.mockResolvedValue({ ...pesertaDb });
            mockCekPassword.mockResolvedValue(false);

            await expect(service.login(inputLogin)).rejects.toBeInstanceOf(UnauthorizedError);
        });

        it("memakai pesan error yang sama persis untuk email tidak ditemukan dan password salah", async () => {
            pesertaRepo.cariDenganPassword.mockResolvedValue(null);
            const galatEmail = (await service.login(inputLogin).catch((e: unknown) => e)) as Error;

            pesertaRepo.cariDenganPassword.mockResolvedValue({ ...pesertaDb });
            mockCekPassword.mockResolvedValue(false);
            const galatPassword = (await service.login(inputLogin).catch((e: unknown) => e)) as Error;

            expect(galatEmail).toBeInstanceOf(UnauthorizedError);
            expect(galatPassword).toBeInstanceOf(UnauthorizedError);
            expect(galatEmail.message).toBeTruthy();
            expect(galatEmail.message).toBe(galatPassword.message);
        });

        it("mengembalikan accessToken dan refreshToken saat berhasil", async () => {
            siapkanLoginBerhasil();

            const hasil = await service.login(inputLogin);

            expect(hasil).toMatchObject({
                accessToken: "ACCESS_TOKEN",
                refreshToken: "REFRESH_TOKEN",
            });
        });

        it("tidak mengembalikan password peserta saat login berhasil", async () => {
            siapkanLoginBerhasil();

            const hasil = await service.login(inputLogin);

            expect(hasil.peserta).not.toHaveProperty("password");
            expect(hasil.peserta).toMatchObject({ id: 1, email: "budi@mail.com" });
        });

        it("menyimpan refresh token dengan expiresAt tepat 7 hari dari sekarang", async () => {
            jest.spyOn(Date, "now").mockReturnValue(NOW);
            siapkanLoginBerhasil();

            await service.login(inputLogin);

            expect(tokenRepo.save).toHaveBeenCalledTimes(1);
            const disimpan = tokenRepo.save.mock.calls[0][0];
            expect(disimpan.token).toBe("REFRESH_TOKEN");
            expect(disimpan.expiresAt.getTime()).toBe(NOW + TUJUH_HARI_MS);
        });
    });

    describe("refresh", () => {
        it("melempar UnauthorizedError jika refresh token tidak ada di database", async () => {
            mockVerifikasiRefreshToken.mockReturnValue({ id: 1, email: "budi@mail.com", role: "peserta" });
            tokenRepo.findOneBy.mockResolvedValue(null);

            await expect(service.refresh("TOKEN_DICABUT")).rejects.toBeInstanceOf(UnauthorizedError);
        });

        it("melempar error jika refresh token tidak valid", async () => {
            mockVerifikasiRefreshToken.mockImplementation(() => {
                throw new UnauthorizedError("Token tidak valid");
            });

            await expect(service.refresh("TOKEN_RUSAK")).rejects.toBeInstanceOf(UnauthorizedError);
        });

        it("mengembalikan accessToken baru jika refresh token valid dan terdaftar", async () => {
            mockVerifikasiRefreshToken.mockReturnValue({ id: 1, email: "budi@mail.com", role: "peserta" });
            tokenRepo.findOneBy.mockResolvedValue({ token: "REFRESH_TOKEN" });
            mockBuatAccessToken.mockReturnValue("ACCESS_BARU");

            const hasil = await service.refresh("REFRESH_TOKEN");

            expect(hasil).toEqual({ accessToken: "ACCESS_BARU" });
        });
    });

    describe("logout", () => {
        it("menghapus refresh token yang dikirim", async () => {
            await service.logout("REFRESH_TOKEN");

            expect(tokenRepo.delete).toHaveBeenCalledWith("REFRESH_TOKEN");
        });
    });
});