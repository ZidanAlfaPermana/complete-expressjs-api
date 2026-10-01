import { Request, Response } from "express";
import {JurnalService, PesertaService} from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import {response, authUtils, AppError} from "../utils";
import { RoleMiddleware } from "../middlewares"

interface JurnalBody {
    pesertaId: number;
    status: "belum" | "selesai" | "proses";
    kegiatan: string;
    hambatan?: string;
    rencanaBesok: string;
    linkCommit?: string;
    review: "sudah" | "belum";
    reviewerId: number;
}

const jurnalService = new JurnalService();
const pesertaService = new PesertaService();

export const getSemuaJurnal = asyncHandler(async (req: Request, res: Response) => {
    const { status, limit, user_id } = req.query;

    const data = await jurnalService.getSemuaJurnal({
        idPeserta: user_id as any,
        status: status as any,
        limit: limit ? Number(limit) : 20
    });

    response.suksesDenganTotal(res, data);
});

export const getJurnalSaya = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const data = await jurnalService.getSemuaJurnal({
        idPeserta: userId,
    });

    response.suksesDenganTotal(res, data);
});

export const getJurnalById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const jurnal = await jurnalService.getJurnalById(id);
    const userId = req.user!.id;

    const userIdFromJurnal = await jurnalService.getUserIdFromJurnal(id);

    if (authUtils.isUserSame(userId, userIdFromJurnal) || !RoleMiddleware.requireRole("mentor")) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    if (!jurnal) {
        res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
        return;
    }

    response.sukses(res, jurnal)
});

export const getJurnalPesertaById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const jurnal = await pesertaService.getPesertaDenganJurnal(id);
    const userId = req.user!.id;

    const userIdFromJurnal = await jurnalService.getUserIdFromJurnal(id);

    if (authUtils.isUserSame(userId, userIdFromJurnal)) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    if (!jurnal || typeof jurnal === null ) {
        res.status(404).json({ error: `Jurnal dengan Peserta id ${id} tidak ditemukan` });
        return;
    }

    response.sukses(res, jurnal)
});

export const getJurnalDenganPeserta = asyncHandler(async (req: Request, res: Response) => {
    const jurnal = await jurnalService.getJurnalDenganPeserta();

    response.suksesDenganTotal(res, jurnal)
});


export const updateStatusReview = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { review } = req.body;

    const jurnalUpdated = await jurnalService.updateStatusReview(id, review);

    if (!jurnalUpdated) {
        response.gagal(res, `Jurnal dengan id ${id} tidak ditemukan`, [], 404)
        return;
    }

    response.diubah(res, jurnalUpdated)
});

export const buatJurnal = asyncHandler(async (req: Request, res: Response) => {
    const jurnalBaru = await jurnalService.buatJurnal(req.body as JurnalBody);
    response.dibuat(res, jurnalBaru);
});

export const updateJurnal = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const userIdFromJurnal = await jurnalService.getUserIdFromJurnal(id);

    if (req.user?.role !== "mentor" && !authUtils.isUserSame(userId, userIdFromJurnal)) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    const jurnalUpdated = await jurnalService.updateJurnal(id, req.body as JurnalBody);

    if (!jurnalUpdated) {
        response.gagal(res, `Jurnal dengan id ${id} tidak ditemukan`, [], 404)
        return;
    }

    response.diubah(res, jurnalUpdated, `Jurnal dengan id ${id} berhasil di edit`)
});

export const hapusJurnal = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const userIdFromJurnal = await jurnalService.getUserIdFromJurnal(id);

    if (authUtils.isUserSame(userId, userIdFromJurnal)) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }
    const deleted = await jurnalService.hapusJurnal(id);

    if (!deleted) {
        response.gagal(res,`Jurnal dengan id ${id} tidak ditemukan`, [], 404)
        return;
    }

    response.sukses(res, [], 'data berhasil dihapus', 204)
});