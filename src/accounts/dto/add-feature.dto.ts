import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { FeatureName } from "@/prisma";
export const EditFeatureSchema = z.object({
  featureName: z.enum(FeatureName),
});
export class EditFeatureDto extends createZodDto(EditFeatureSchema) {}
