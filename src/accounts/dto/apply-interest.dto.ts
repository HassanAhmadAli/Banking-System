import { z } from "zod";
import { createZodDto } from "nestjs-zod";
export const ApplyInterestSchema = z.object({
  days: z.int().positive().default(30),
});
export class ApplyInterestDto extends createZodDto(ApplyInterestSchema) {}
