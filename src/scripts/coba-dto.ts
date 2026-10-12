import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterDto } from "../dto/auth.dto";

async function coba(payload: Record<string, unknown>): Promise<void> {
    const instance = plainToInstance(RegisterDto, payload);
    const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
    });
    console.log(JSON.stringify(errors, null, 2));
}

coba({"nama":"Budi Agung","sekolah":"SMKN 5 Malang","email":"budi@gmail.com","password":"rahasia123"});