import { cleanupOpenApiDoc } from "nestjs-zod";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { EnvVariables } from "./common/schema/env";
import { env } from "./common/env";
import { HttpException, HttpStatus } from "@nestjs/common";

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

  app.useGlobalFilters({
    catch(exception: any, host: any) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

      console.error("❌ ERROR:", exception.message);

      response.status(status).json({
        success: false,
        error: exception.message || "Something went wrong",
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    },
  } as any);

  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(config.getOrThrow("PORT", { infer: true }));
}
void bootstrap();
