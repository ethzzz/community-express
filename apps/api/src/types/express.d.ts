import type { AccessPayload } from "../modules/auth/token.service.ts";

declare global {
    namespace Express {
        interface Request {
            user?: AccessPayload;
        }
    }
}