import { Request, Response } from "express";
import {JurnalService, PesertaService} from "../services";
import { asyncHandler } from "../utils/asyncHandler";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const [
        total_peserta,
        total_jurnal,
        total_belum_direview,
        rata_rata_jurnal_persiswa
    ] = await Promise.all([
        PesertaService.getTotalPeserta(),
        JurnalService.getTotalJurnal(),
        JurnalService.getTotalJurnalBelumReview(),
        JurnalService.getRataRataJurnalPeserta()
    ]);
    const data = {
        total_peserta,
        total_jurnal,
        total_belum_direview,
        rata_rata_jurnal_persiswa
    };

    res.json({ data });
});