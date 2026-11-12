import type { Prisma } from "@prisma/client";

export async function enqueueOutbox(
    tx: Prisma.TransactionClient,
    type: string,
    payload: Record<string, unknown>
) {
    await tx.outboxEvent.create({
        data: { type, payload: payload as unknown as Prisma.InputJsonValue },
    })
}