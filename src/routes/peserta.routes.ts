import { Router } from "express";
import { PesertaController, JurnalController } from "./../controllers";
import {ValidationMiddleware, AuthMiddleware, RoleMiddleware} from "../middlewares";
import {PesertaDto, UpdateProfilDto} from "../dto/peserta.dto";

const router = Router();

router.get("/", PesertaController.getSemuaPeserta);
router.get("/me", AuthMiddleware.authGuard, PesertaController.getProfilSaya);
router.patch("/me", AuthMiddleware.authGuard, ValidationMiddleware.validasi(UpdateProfilDto), PesertaController.updateProfileSaya);
router.get("/:id", AuthMiddleware.authGuard, PesertaController.getPesertaById);
router.get("/:id/jurnal", AuthMiddleware.authGuard, JurnalController.getJurnalPesertaById);
router.post("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(PesertaDto), PesertaController.buatPeserta);
router.put("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(PesertaDto), PesertaController.updatePeserta);
router.patch("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(PesertaDto), PesertaController.updateProfilePeserta);
router.delete("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), PesertaController.hapusPeserta);

export default router;