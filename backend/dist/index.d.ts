import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
declare const app: Express;
declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export { app, prisma };
//# sourceMappingURL=index.d.ts.map