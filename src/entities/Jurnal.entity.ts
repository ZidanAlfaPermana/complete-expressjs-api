import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Peserta } from "./Peserta.entity";
import { Mentor } from "./Mentor.entity";

export type StatusReview = "belum" | "sudah";
export type Status = "belum" | "selesai" | "proses";

@Entity("jurnal_harian")
export class JurnalHarian {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "pesertaId" })
    pesertaId!: number;

    @Column({ type: "text" })
    kegiatan!: string;

    @Column({ type: "text", nullable: true })
    hambatan?: string;

    @Column({ type: "text" })
    rencanaBesok?: string;

    @Column({ type: "varchar", nullable: true })
    linkCommit?: string;

    @Column({ type: "enum", enum: ["belum", "sudah"], default: "belum" })
    review!: StatusReview;

    @Column({ type: "enum", enum: ["belum", "selesai", "proses"], default: "belum" })
    status!: Status;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => Peserta, (peserta) => peserta.jurnalList, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "pesertaId" })
    peserta!: Peserta;

    @Column({ name: "reviewerId", nullable: true })
    reviewerId?: number;

    @ManyToOne(() => Mentor, (mentor) => mentor.jurnalList, {
        onDelete: "SET NULL"
    })
    @JoinColumn({ name: "reviewerId" })
    reviewer!: Mentor;
}