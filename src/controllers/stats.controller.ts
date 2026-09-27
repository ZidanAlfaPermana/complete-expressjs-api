import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {Peserta} from "../entities";
import {AppDataSource} from "../config/database.config";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const result = await AppDataSource.getRepository(Peserta)
        .createQueryBuilder("p")
        .leftJoin("p.jurnalList", "j")
        .select("COUNT(DISTINCT p.id)", "total_peserta")
        .addSelect("COUNT(j.id)", "total_jurnal")
        .addSelect("COUNT(CASE WHEN j.review = 'belum' THEN 1 END)", "total_belum_direview")
        .getRawOne();

    const total_peserta = Number(result.total_peserta || 0);
    const total_jurnal = Number(result.total_jurnal || 0);
    const total_belum_direview = Number(result.total_belum_direview || 0);
    const rata_rata_jurnal_persiswa = total_peserta > 0
        ? (total_jurnal / total_peserta).toFixed(2)
        : "0";

    const data = {
        total_peserta,
        total_jurnal,
        total_belum_direview,
        rata_rata_jurnal_persiswa
    };

    res.json({ data });
});