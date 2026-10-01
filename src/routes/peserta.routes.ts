import { Router } from "express";
import { PesertaController, JurnalController } from "./../controllers";
import {ValidationMiddleware, AuthMiddleware, RoleMiddleware} from "../middlewares";

const router = Router();

router.get("/", PesertaController.getSemuaPeserta);
router.get("/profil-saya", AuthMiddleware.authGuard, PesertaController.getProfilSaya);
router.get("/:id", AuthMiddleware.authGuard, PesertaController.getPesertaById);
router.get("/:id/jurnal", AuthMiddleware.authGuard, JurnalController.getJurnalPesertaById);
router.post("/", AuthMiddleware.authGuard, ValidationMiddleware.validasiPeserta, PesertaController.buatPeserta);
router.put("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasiPeserta, PesertaController.updatePeserta);
router.delete("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), PesertaController.hapusPeserta);

export default router;