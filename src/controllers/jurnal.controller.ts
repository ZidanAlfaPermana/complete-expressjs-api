import { Request, Response } from "express";
import {JurnalService, pesertaService} from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import {response, authUtils, AppError} from "../utils";
import { RoleMiddleware } from "../middlewares"
import {buatMeta} from "../utils/pagination";
import {IdParamDto} from "../dto/common.dto";
import {ambilDto} from "../middlewares/validasi.middleware";
import {JurnalDto, ListJurnalQueryDto, ReviewJurnalDto} from "../dto/jurnal.dto";
import {serialisasi} from "../utils/serialisasi";
import {JurnalResponseDto} from "../dto/response/jurnal.response";
import {AppDataSource} from "../config/database.config";
import {JurnalHarian, Mentor, Peserta} from "../entities";

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

const jurnalService = new JurnalService(AppDataSource.getRepository(Peserta), AppDataSource.getRepository(JurnalHarian), AppDataSource.getRepository(Mentor));

function parseTanggal(nilai: unknown, akhirHari = false): Date | undefined {
    if (typeof nilai !== "string" || !nilai) return undefined;
    const d = new Date(`${nilai}T${akhirHari ? "23:59:59.999" : "00:00:00"}`);
    if (isNaN(d.getTime())) throw new Error(`Format tanggal tidak valid: ${nilai} (pakai YYYY-MM-DD)`);
    return d;
}

export const getSemuaJurnal = asyncHandler(async (req: Request, res: Response) => {
    const query = ambilDto<ListJurnalQueryDto>(req, "query");

    const { data, total } = await jurnalService.getSemuaJurnal(query, {
        pesertaId: query.pesertaId,
        statusReview: query.statusReview ?? (query.belumDireview ? "belum" : undefined),
        from: parseTanggal(query.from),
        to: parseTanggal(query.to, true),
    });
    response.suksesDenganMeta(res, serialisasi(JurnalResponseDto, data), buatMeta(query.page, query.limit, total));
});

export const getJurnalSaya = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const data = await jurnalService.getJurnalByPesertaId(userId);

    response.suksesDenganTotal(res, data);
});

export const getJurnalById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
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
    const { id } = ambilDto<IdParamDto>(req, "params");
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


export const updateReviewJurnal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const { statusReview, catatan } = ambilDto<ReviewJurnalDto>(req, "body");

    const jurnalUpdated = await jurnalService.updateReviewJurnal(
        id,
        { id: req.user!.id, role: req.user!.role },
        statusReview,
        catatan,
        req.user?.email
    );

    if (!jurnalUpdated) {
        response.gagal(res, `Jurnal dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.diubah(res, serialisasi(JurnalResponseDto, jurnalUpdated));
});

export const buatJurnal = asyncHandler(async (req: Request, res: Response) => {
    const dto = ambilDto<JurnalDto>(req, "body");
    const pesertaId = req.user!.id;

    const jurnal = await jurnalService.buatJurnal(pesertaId, dto);
    response.dibuat(res, serialisasi(JurnalResponseDto, jurnal));
});

export const updateJurnal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const userId = req.user!.id;
    const userIdFromJurnal = await jurnalService.getUserIdFromJurnal(id);

    if (req.user?.role !== "mentor" && !authUtils.isUserSame(userId, userIdFromJurnal)) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    const jurnalUpdated = await jurnalService.updateJurnal(id, req.body as JurnalBody, { id: req.user!.id, role: req.user!.role });

    if (!jurnalUpdated) {
        response.gagal(res, `Jurnal dengan id ${id} tidak ditemukan`, [], 404)
        return;
    }

    response.diubah(res, jurnalUpdated, `Jurnal dengan id ${id} berhasil di edit`)
});

export const updateJurnalBeberapa = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const userId = req.user!.id;
    const userIdFromJurnal = await jurnalService.getUserIdFromJurnal(id);

    if (req.user?.role !== "mentor" && !authUtils.isUserSame(userId, userIdFromJurnal)) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    const jurnalUpdated = await jurnalService.updateBeberapaDataJurnal(id, req.body as JurnalBody, { id: req.user!.id, role: req.user!.role });

    if (!jurnalUpdated) {
        response.gagal(res, `Jurnal dengan id ${id} tidak ditemukan`, [], 404)
        return;
    }

    response.diubah(res, jurnalUpdated, `Jurnal dengan id ${id} berhasil di edit`)
});

export const hapusJurnal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const userId = req.user!.id;
    const userIdFromJurnal = await jurnalService.getUserIdFromJurnal(id);

    if (authUtils.isUserSame(userId, userIdFromJurnal)) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }
    const deleted = await jurnalService.hapusJurnal(id, { id: req.user!.id, role: req.user!.role });

    if (!deleted) {
        throw new AppError.NotFoundError(`Jurnal dengan id ${id} tidak ditemukan`);
    }

    response.sukses(res, [], 'data berhasil dihapus', 204)
});