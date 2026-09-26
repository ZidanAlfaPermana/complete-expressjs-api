import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { JurnalHarian } from "./Jurnal.entity";

@Entity("mentor")   // nama tabel di database
export class Mentor {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    nama!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    spesialisasi?: string; // Contoh: "Backend", "Frontend", "UI/UX"

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => JurnalHarian, (jurnal) => jurnal.reviewer)
    jurnalList!: JurnalHarian[];
}