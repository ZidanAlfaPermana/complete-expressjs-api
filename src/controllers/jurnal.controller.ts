import { Request, Response } from "express";
import {JurnalService, PesertaService} from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import {response} from "../utils";

interface JurnalBody {
    idPeserta: number;
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
    const { peserta, status, limit } = req.query;

    const data = await jurnalService.getSemuaJurnal({
        idPeserta: peserta ? Number(peserta) : undefined,
        status: status as any,
        limit: limit ? Number(limit) : 20
    });

    response.suksesDenganTotal(res, data);
});

export const getJurnalById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const jurnal = await jurnalService.getJurnalById(id);

    if (!jurnal) {
        res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
        return;
    }

    response.sukses(res, jurnal)
});

export const getJurnalPesertaById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const jurnal = await pesertaService.getPesertaDenganJurnal(id);

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
    const jurnalUpdated = await jurnalService.updateJurnal(id, req.body as JurnalBody);

    if (!jurnalUpdated) {
        response.gagal(res, `Jurnal dengan id ${id} tidak ditemukan`, [], 404)
        return;
    }

    response.diubah(res, jurnalUpdated, `Jurnal dengan id ${id} berhasil di edit`)
});

export const hapusJurnal = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await jurnalService.hapusJurnal(id);

    if (!deleted) {
        response.gagal(res,`Jurnal dengan id ${id} tidak ditemukan`, [], 404)
        return;
    }

    response.sukses(res, [], 'data berhasil dihapus', 204)
});