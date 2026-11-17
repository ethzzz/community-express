import { BadRequestException } from '@nestjs/common';

export function parseId(value: string, field = 'id'): bigint {
    if (!/^\d+$/.test(value)) {
        throw new BadRequestException(`Invalid ${field}`);
    }
    return BigInt(value);
}
