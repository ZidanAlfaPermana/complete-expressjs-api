import { Router } from "express";
import { PesertaController, JurnalController } from "./../controllers";
import {ValidationMiddleware, AuthMiddleware, RoleMiddleware} from "../middlewares";
import {ListPesertaQueryDto, PesertaDto, UpdateProfilDto} from "../dto/peserta.dto";
import {IdParamDto} from "../dto/common.dto";

const router = Router();

router.get("/", ValidationMiddleware.validasi(ListPesertaQueryDto, "query"), PesertaController.getSemuaPeserta);
router.get("/me", AuthMiddleware.authGuard, PesertaController.getProfilSaya);
router.patch("/me", AuthMiddleware.authGuard, ValidationMiddleware.validasi(UpdateProfilDto), PesertaController.updateProfileSaya);
router.get("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasi(IdParamDto, "params"), PesertaController.getPesertaById);
router.get("/:id/jurnal", AuthMiddleware.authGuard, ValidationMiddleware.validasi(IdParamDto, "params"), JurnalController.getJurnalPesertaById);
router.post("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(PesertaDto), PesertaController.buatPeserta);
router.put("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(PesertaDto), PesertaController.updatePeserta);
router.patch("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(PesertaDto), PesertaController.updateProfilePeserta);
router.delete("/:id", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), PesertaController.hapusPeserta);

export default router;