import { AppError } from "./errors.ts";

export function parseBigIntId(value: string | string[] | undefined, field = "id"): bigint {
    if (typeof value !== "string" || !/^\d+$/.test(value)) {
        throw new AppError("INVALID_ID", 400, `Invalid ${field}`);
    }

    return BigInt(value);
}
