import { z } from "zod";
import { createZodDto } from "nestjs-zod";
export const CreateCompositeAccountSchema = z.object({
  childAccountIds: z.int().positive().array().nonempty(),
  userId: z.int().positive(),
});
export class CreateCompositeAccountDto extends createZodDto(CreateCompositeAccountSchema) {}
