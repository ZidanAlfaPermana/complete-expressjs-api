import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import {response} from "../utils";
import {UnauthorizedError} from "../utils/AppError";

export const register = asyncHandler(async (req, res) => {
    const data = await authService.register(req.body);

    if (!data) {
        response.gagal(res, data, [], 409);
        return;
    }

    response.dibuat(res, data, "Registrasi berhasil");
});

export const login = asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);

    if (!data) {
        response.gagal(res, data, [], 401);
        return;
    }

    response.sukses(res, data, "Login berhasil");
});

export const logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Token tidak ditemukan");
    }

    const token = authHeader.split(" ")[1];
    await authService.logout(token);
    response.sukses(res, 200);
})

export const refresh = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Token tidak ditemukan");
    }

    const token = authHeader.split(" ")[1];
    const refresh = await authService.refresh(token);
    response.sukses(res, refresh, "Refresh Token berhasil", 200);
})