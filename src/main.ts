import { cleanupOpenApiDoc } from "nestjs-zod";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { EnvVariables } from "./common/schema/env";
import { env } from "./common/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: env!.ENABLE_Devtools,
    logger: ["debug", "error", "fatal", "log", "verbose", "warn"],
  });

  const config = app.get(ConfigService<EnvVariables>);
  if (config.getOrThrow("ENABLE_SWAGGER", { infer: true })) {
    const openApiDoc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("Banking System")
        .setDescription("Banking System App Documentation")
        .setVersion("1.0")
        .build(),
    );
    SwaggerModule.setup("swagger", app, cleanupOpenApiDoc(openApiDoc));
  }
  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(config.getOrThrow("PORT", { infer: true }));
}
void bootstrap();
