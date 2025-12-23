import { z } from "zod";
import { createZodDto } from "nestjs-zod";
export const TransactionSchema = z.object({ amount: z.int().positive() });
export class TransactionDto extends createZodDto(TransactionSchema) {}
