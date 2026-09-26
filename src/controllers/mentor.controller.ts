import { Request, Response } from "express";
import { MentorService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";

const mentorService = new MentorService();

export const getSemuaMentor = asyncHandler(async (req: Request, res: Response) => {
    const data = await mentorService.getSemuaMentor();
    res.json({ total: data.length, data });
});

export const getMentorById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const mentor = await mentorService.getMentorById(id);

    if (!mentor) {
        res.status(404).json({ error: `Mentor dengan id ${id} tidak ditemukan` });
        return;
    }

    res.json(mentor);
});

export const buatMentor = asyncHandler(async (req: Request, res: Response) => {
    const mentorBaru = await mentorService.buatMentor(req.body);
    res.status(201).json(mentorBaru);
});

export const updateMentor = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const mentorUpdated = await mentorService.updateMentor(id, req.body);

    if (!mentorUpdated) {
        res.status(404).json({ error: `Mentor dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(200).json({ message: `Mentor dengan id ${id} berhasil di edit`, data: mentorUpdated });
});

export const hapusMentor = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await mentorService.hapusMentor(id);

    if (!deleted) {
        res.status(404).json({ error: `Mentor dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(204).send();
});