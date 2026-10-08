import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany, JoinTable
} from "typeorm";
import {JurnalHarian} from "./Jurnal.entity";
import {Skill} from "./Skill.entity";

export type StatusPeserta = "aktif" | "lulus" | "berhenti";

@Entity("peserta")   // nama tabel di database
export class Peserta {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    nama!: string;

    @Column({ type: "varchar", length: 100 })
    sekolah!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    email!: string;

    @Column({ type: "int", default: 1 })
    fase!: number;

    @Column({ type: "enum", enum: ["aktif", "lulus", "berhenti"], default: "aktif" })
    status!: StatusPeserta;

    @Column({ type: "varchar", select: false })
    password!: string;   // ini SELALU berisi hash, tidak pernah plaintext

    @Column({ type: "varchar", default: "peserta" })
    role!: "peserta" | "mentor";   // dipakai untuk RBAC di hari Kamis

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // "Satu peserta punya banyak jurnal"
    @OneToMany(() => JurnalHarian, (jurnal) => jurnal.peserta)
    jurnalList!: JurnalHarian[];

    @ManyToMany(() => Skill, (skill) => skill.peserta)
    @JoinTable({ name: "peserta_skill" })   // tabel penghubung — HANYA di satu sisi
    skills!: Skill[];
}