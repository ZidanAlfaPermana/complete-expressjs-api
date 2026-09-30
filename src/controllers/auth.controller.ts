import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import {response} from "../utils";

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