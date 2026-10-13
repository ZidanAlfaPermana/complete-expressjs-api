import { Router } from "express";
import { AuthController } from "../controllers";
import { validasi } from "../middlewares/validasi.middleware";
import {loginLimiter} from "../middlewares/rateLimit.middleware";
import {LoginDto, RegisterDto} from "../dto/auth.dto";

const router = Router();

// src/routes/auth.routes.ts
router.post("/register", validasi(RegisterDto), AuthController.register);
router.post("/login", loginLimiter, validasi(LoginDto), AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

export default router;