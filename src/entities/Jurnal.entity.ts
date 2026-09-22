// src/entities/Jurnal.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export type StatusReview = "belum" | "sudah";

@Entity("jurnal_harian")
export class JurnalHarian {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    pesertaId!: number;

    @Column({ type: "text" })
    kegiatan!: string;

    @Column({ type: "text", nullable: true })
    hambatan?: string;

    @Column({ type: "varchar", nullable: true })
    linkCommit?: string;

    @Column({ type: "enum", enum: ["belum", "sudah"], default: "belum" })
    review!: StatusReview;

    @CreateDateColumn()
    createdAt!: Date;
}