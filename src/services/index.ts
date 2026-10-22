export { JurnalService } from "./jurnal.service";
export { PesertaService } from "./peserta.service";
export { MentorService } from "./mentor.services";
export { SkillService } from "./skill.services";
import { AppDataSource } from "../config/database.config";
import {JurnalHarian, Mentor, Peserta, Skill} from "../entities";
import { JurnalService } from "./jurnal.service";
import { PesertaService } from "./peserta.service";
import { SkillService } from "./skill.services";
import { MentorService } from "./mentor.services";

export const pesertaService = new PesertaService(AppDataSource.getRepository(Peserta));
export const jurnalService = new JurnalService(AppDataSource.getRepository(Peserta), AppDataSource.getRepository(JurnalHarian), AppDataSource.getRepository(Mentor));
export const skillService = new SkillService(AppDataSource.getRepository(Skill));
export const mentorService = new MentorService(AppDataSource.getRepository(Mentor));