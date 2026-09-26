import { Request, Response } from "express";
import {JurnalService, PesertaService} from "../services";
import { asyncHandler } from "../utils/asyncHandler";

const jurnalService = new JurnalService();

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const [
        total_peserta,
        total_jurnal,
        total_belum_direview,
        rata_rata_jurnal_persiswa
    ] = await Promise.all([
        new PesertaService().getTotalPeserta(),
        jurnalService.getTotalJurnal(),
        jurnalService.getTotalJurnalBelumReview(),
        jurnalService.getRataRataJurnalPeserta()
    ]);
    const data = {
        total_peserta,
        total_jurnal,
        total_belum_direview,
        rata_rata_jurnal_persiswa
    };

    res.json({ data });
});