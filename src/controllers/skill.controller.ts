import { Request, Response } from "express";
import { SkillService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { response } from "../utils";
import {AppError} from "../utils";

const skillService = new SkillService();

export const getSemuaSkill = asyncHandler(async (req: Request, res: Response) => {
    const data = await skillService.getSemuaSkill();
    response.suksesDenganTotal(res, data);
});

export const getSkillById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const skill = await skillService.getSkillById(id);

    if (!skill) {
        throw new AppError.NotFoundError(`Skill dengan id ${id} tidak ditemukan`);
    }

    response.sukses(res, skill);
});

export const buatSkill = asyncHandler(async (req: Request, res: Response) => {
    const skillBaru = await skillService.buatSkill(req.body);
    response.dibuat(res, skillBaru);
});

export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const skillUpdated = await skillService.updateSkill(id, req.body);

    if (!skillUpdated) {
        throw new AppError.NotFoundError(`Skill dengan id ${id} tidak ditemukan`);
    }

    response.diubah(res, skillUpdated, `Skill dengan id ${id} berhasil di edit`);
});

export const hapusSkill = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await skillService.hapusSkill(id);

    if (!deleted) {
        throw new AppError.NotFoundError(`Skill dengan id ${id} tidak ditemukan`);
    }

    response.sukses(res, [], "Data berhasil dihapus", 204);
});