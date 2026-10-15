// src/dto/response/mentor.response.ts
import { Expose } from "class-transformer";

export class MentorResponseDto {
    @Expose() id!: number;
    @Expose() nama!: string;
    @Expose() email!: string;
    @Expose() keahlian!: string[];
    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;
}