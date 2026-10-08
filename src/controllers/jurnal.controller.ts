import { Request, Response } from "express";
import {JurnalService, PesertaService} from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import {response, authUtils, AppError} from "../utils";
import { RoleMiddleware } from "../middlewares"
import {SORT_JURNAL} from "../services/jurnal.service";
import {buatMeta, parseListQuery} from "../utils/pagination";

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

function parseTanggal(nilai: unknown, akhirHari = false): Date | undefined {
    if (typeof nilai !== "string" || !nilai) return undefined;
    const d = new Date(`${nilai}T${akhirHari ? "23:59:59.999" : "00:00:00"}`);
    if (isNaN(d.getTime())) throw new Error(`Format tanggal tidak valid: ${nilai} (pakai YYYY-MM-DD)`);
    return d;
}

export const getSemuaJurnal = asyncHandler(async (req: Request, res: Response) => {
    const lq = parseListQuery(req.query, SORT_JURNAL);

    const pesertaId = req.query.pesertaId ? Number(req.query.pesertaId) : undefined;
    const review = typeof req.query.review === "string" ? req.query.review : undefined;
    const from = parseTanggal(req.query.from);
    const to = parseTanggal(req.query.to, true);

    const { data, total } = await jurnalService.getSemuaJurnal(lq, { pesertaId, review, from, to });
    response.suksesDenganMeta(res, data, buatMeta(lq.page, lq.limit, total));
});

export const getJurnalSaya = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const data = await jurnalService.getJurnalByPesertaId(userId);

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