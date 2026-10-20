// src/middlewares/validasi.middleware.ts
import { Request, RequestHandler } from "express";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationError } from "../utils/AppError";
import {ratakan, validasiDto} from "../utils/validasi.util";

type Sumber = "body" | "query" | "params";

export function validasi<T extends object>(
    dto: ClassConstructor<T>,
    sumber: Sumber = "body"
): RequestHandler {
    return async (req, _res, next) => {
        try {
            const instance = await validasiDto(dto, req[sumber], sumber);
            req.validated = { ...req.validated, [sumber]: instance };
            next();
        } catch (err) {
            next(err);
        }
    };
}

// Helper untuk membaca data tervalidasi di controller
export function ambilDto<T>(req: Request, sumber: Sumber = "body"): T {
    return req.validated?.[sumber] as T;
}