import { z } from "zod";
import { createZodDto } from "nestjs-zod";
export const CompareInterestSchema = z.object({
  days: z.coerce.number().int().positive().default(30),
  balance: z.coerce.number().int(),
});
export class CompareInterestDto extends createZodDto(CompareInterestSchema) {}
