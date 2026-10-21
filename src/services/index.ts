export { JurnalService } from "./jurnal.service";
export { PesertaService } from "./peserta.service";
export { MentorService } from "./mentor.services";
export { SkillService } from "./skill.services";
import { AppDataSource } from "../config/database.config";
import {JurnalHarian, Mentor, Peserta} from "../entities";
import { JurnalService } from "./jurnal.service";
import { PesertaService } from "./peserta.service";

export const pesertaService = new PesertaService(AppDataSource.getRepository(Peserta));
export const jurnalService = new JurnalService(AppDataSource.getRepository(Peserta), AppDataSource.getRepository(JurnalHarian), AppDataSource.getRepository(Mentor));