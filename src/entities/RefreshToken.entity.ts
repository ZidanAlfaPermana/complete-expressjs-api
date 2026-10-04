// src/entities/RefreshToken.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Peserta } from "./Peserta.entity";

@Entity("refresh_token")
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    token!: string;

    @ManyToOne(() => Peserta)
    peserta!: Peserta;

    @Column({ type: "timestamp" })
    expiresAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}