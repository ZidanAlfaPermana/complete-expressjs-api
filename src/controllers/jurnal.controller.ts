import { Request, Response } from "express";
import { JurnalService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";

interface JurnalBody {
    idPeserta: number;
    status: "belum" | "selesai" | "proses";
    kegiatan: string;
    hambatan?: string;
    rencanaBesok: string;
    linkCommit?: string;
    review: "sudah" | "belum"
}

export const getSemuaJurnal = asyncHandler(async (req: Request, res: Response) => {
    const { peserta, status, limit } = req.query;

    const data = await JurnalService.getSemuaJurnal({
        idPeserta: peserta ? Number(peserta) : undefined,
        status: status as any,
        limit: limit ? Number(limit) : 20
    });

    res.json({ total: data.length, data });
});

export const getJurnalById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const jurnal = await JurnalService.getJurnalById(id);

    if (!jurnal) {
        res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
        return;
    }

    res.json(jurnal);
});

export const getJurnalPesertaById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const jurnal = await JurnalService.getJurnalByPesertaId(id);

    if (!jurnal || jurnal.length === 0) {
        res.status(404).json({ error: `Jurnal dengan Peserta id ${id} tidak ditemukan` });
        return;
    }

    res.json(jurnal);
});

export const updateStatusReview = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { review } = req.body;

    const jurnalUpdated = await JurnalService.updateStatusReview(id, review);

    if (!jurnalUpdated) {
        res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(200).json({ message: `Status review jurnal dengan id ${id} berhasil diubah`, data: jurnalUpdated });
});

export const buatJurnal = asyncHandler(async (req: Request, res: Response) => {
    const jurnalBaru = await JurnalService.buatJurnal(req.body as JurnalBody);
    res.status(201).json(jurnalBaru);
});

export const updateJurnal = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const jurnalUpdated = await JurnalService.updateJurnal(id, req.body as JurnalBody);

    if (!jurnalUpdated) {
        res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(200).json({ message: `Jurnal dengan id ${id} berhasil di edit`, data: jurnalUpdated });
});

export const hapusJurnal = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await JurnalService.hapusJurnal(id);

    if (!deleted) {
        res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(204).send();
});