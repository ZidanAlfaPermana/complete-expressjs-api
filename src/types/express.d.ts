declare global {
    namespace Express {
        interface Request {
            user?: { id: number; nama: string };
            requestId?: string;
        }
    }
}

export {};