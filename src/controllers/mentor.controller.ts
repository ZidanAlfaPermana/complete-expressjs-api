import { Request, Response } from "express";
import { MentorService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { response } from "../utils";
import {AppError} from "../utils";
import {ambilDto} from "../middlewares/validasi.middleware";
import {IdParamDto} from "../dto/common.dto";

const mentorService = new MentorService();

export const getSemuaMentor = asyncHandler(async (req: Request, res: Response) => {
    const data = await mentorService.getSemuaMentor();
    response.suksesDenganTotal(res, data);
});

export const getMentorById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const mentor = await mentorService.getMentorById(id);

    if (!mentor) {
        throw new AppError.NotFoundError(`Mentor dengan id ${id} tidak ditemukan`);
    }

    response.sukses(res, mentor);
});

export const buatMentor = asyncHandler(async (req: Request, res: Response) => {
    const mentorBaru = await mentorService.buatMentor(req.body);
    response.dibuat(res, mentorBaru);
});

export const updateMentor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const mentorUpdated = await mentorService.updateMentor(id, req.body);

    if (!mentorUpdated) {
        throw new AppError.NotFoundError(`Mentor dengan id ${id} tidak ditemukan`);
    }

    response.diubah(res, mentorUpdated, `Mentor dengan id ${id} berhasil di edit`);
});

export const hapusMentor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = ambilDto<IdParamDto>(req, "params");
    const deleted = await mentorService.hapusMentor(id);

    if (!deleted) {
        throw new AppError.NotFoundError(`Mentor dengan id ${id} tidak ditemukan`);
    }

    response.sukses(res, [], "Data berhasil dihapus", 204);
});