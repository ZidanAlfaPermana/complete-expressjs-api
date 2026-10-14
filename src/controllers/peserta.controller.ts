import { Request, Response } from "express";
import { PesertaService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { response, authUtils, AppError } from "../utils";
import {buatMeta} from "../utils/pagination";
import {suksesDenganMeta} from "../utils/response";
import {ambilDto} from "../middlewares/validasi.middleware";
import {IdParamDto} from "../dto/common.dto";
import {ListPesertaQueryDto} from "../dto/peserta.dto";

interface PesertaBody {
    nama: string;
    email: string;
    password: string;
    status: "aktif" | "berhenti" | "lulus";
    sekolah: string;
    role: "peserta" | "mentor"
    fase: number;
}

const pesertaService = new PesertaService();

// Controller: tidak ada lagi parseListQuery dan konversi manual
export const getSemuaPeserta = asyncHandler(async (req, res) => {
    const query = ambilDto<ListPesertaQueryDto>(req, "query");

    const { data, total } = await pesertaService.getSemuaPeserta(query, {
        sekolah: query.sekolah,
        fase: query.fase,
    });

    suksesDenganMeta(res, data, buatMeta(query.page, query.limit, total));
});

export const getPesertaById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");

    if (!authUtils.isUserSame(req.user!.id, id) && req.user?.role !== "mentor") {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    const peserta = await pesertaService.getPesertaById(id);

    if (!peserta) {
        throw new AppError.NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    }

    response.sukses(res, peserta);
});

export const buatPeserta = asyncHandler(async (req: Request<{}, {}, PesertaBody>, res: Response) => {
    const pesertaBaru = await pesertaService.buatPeserta(req.body);
    res
        .status(201)
        .location(`/api/v1/peserta/${pesertaBaru.id}`)
        .json({ sukses: true, pesan: "Peserta berhasil dibuat", data: pesertaBaru });
});

export const updatePeserta = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");

    if (!authUtils.isUserSame(req.user!.id, id)) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    const pesertaUpdated = await pesertaService.updatePeserta(id, req.body as PesertaBody);

    if (!pesertaUpdated) {
        throw new AppError.NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    }

    response.diubah(res, pesertaUpdated, `Peserta dengan id ${id} berhasil di edit`);
});

export const updateProfileSaya = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.user!.id);

    if (!authUtils.isUserSame(req.user!.id, id)) {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    const pesertaUpdated = await pesertaService.updatePesertaBeberapa(id, req.body as PesertaBody);

    if (!pesertaUpdated) {
        throw new AppError.NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    }

    response.diubah(res, pesertaUpdated, `Peserta dengan id ${id} berhasil di edit`);
});

export const hapusPeserta = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");

    if (req.user!.role !== "mentor") {
        throw new AppError.ForbiddenError("Anda tidak memiliki akses untuk mengubah data ini");
    }

    const deleted = await pesertaService.hapusPeserta(id);

    if (!deleted) {
        throw new AppError.NotFoundError(`Peserta dengan id ${id} tidak ditemukan`);
    }

    res.status(204).send();
});

export const getProfilSaya = asyncHandler(async (req, res) => {

    const userId = req.user!.id;

    const peserta = await pesertaService.getPesertaById(userId);
    response.sukses(res, peserta);
});

export const updateProfilePeserta = asyncHandler(async (req, res) => {

    const userId = req.params!.id;

    const peserta = await pesertaService.ubahProfil(Number(userId), req.body as PesertaBody);
    response.sukses(res, peserta);
});