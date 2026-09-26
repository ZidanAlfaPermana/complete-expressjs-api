import { Router } from "express";
import pesertaRoutes from "./peserta.routes";
import jurnalRoutes from "./jurnal.routes";
import mentorRoutes from "./mentor.routes";
import {getStats} from "../controllers";
import skillRoutes from "./skill.routes";

const router = Router();

router.use("/peserta", pesertaRoutes);
router.use("/jurnal", jurnalRoutes);
router.use("/stats", getStats);
router.use("/mentor", mentorRoutes);
router.use("/skill", skillRoutes);

export default router;