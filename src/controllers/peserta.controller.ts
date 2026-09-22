import { Request, Response } from "express";
import { Peserta } from "../types";
import { PesertaService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";

interface PesertaBody {
    nama: string;
    kelas: string;
    jurusan: string;
    sekolah: string;
    fase: number;
}

export const getSemuaPeserta = asyncHandler(async (req: Request, res: Response) => {
    const { sekolah, fase, limit } = req.query;

    const data = await PesertaService.getSemuaPeserta({
        sekolah: sekolah as string,
        fase: fase ? Number(fase) : undefined,
        limit: limit ? Number(limit) : 20
    });

    res.json({ total: data.length, data });
});

export const getPesertaById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const peserta = await PesertaService.getPesertaById(id);

    if (!peserta) {
        res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
        return;
    }

    res.json(peserta);
});

export const buatPeserta = asyncHandler(async (req: Request<{}, {}, PesertaBody>, res: Response) => {
    const pesertaBaru = await PesertaService.buatPeserta(req.body);
    res.status(201).json(pesertaBaru);
});

export const updatePeserta = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const pesertaUpdated = await PesertaService.updatePeserta(id, req.body as PesertaBody);

    if (!pesertaUpdated) {
        res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(200).json({ message: `Peserta dengan id ${id} berhasil di edit`, data: pesertaUpdated });
});

export const hapusPeserta = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await PesertaService.hapusPeserta(id);

    if (!deleted) {
        res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(204).send();
});