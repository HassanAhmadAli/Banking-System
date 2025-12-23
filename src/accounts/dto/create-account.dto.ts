import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { AccountType } from "@/prisma";

export const CreateAccountSchema = z.object({
  accountType: z.enum(AccountType),
  userId: z.int().positive(),
});

export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}
