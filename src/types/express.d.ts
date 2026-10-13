// src/types/express.d.ts — tambahkan properti validated
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            requestId?: string;
            validated?: { body?: unknown; query?: unknown; params?: unknown };
        }
    }
}
export {};