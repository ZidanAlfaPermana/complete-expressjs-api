// src/entities/Skill.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Peserta } from "./Peserta.entity";

@Entity("skill")   // nama tabel di database
export class Skill {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", unique: true })
    nama!: string;   // "TypeScript", "Express", "PostgreSQL"

    @ManyToMany(() => Peserta, (peserta) => peserta.skills)
    peserta!: Peserta[];
}