import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import type { Env } from "./config/env.schema";

/**
 * Thin bootstrap: wire cross-cutting concerns (logging, security headers,
 * global prefix, uniform error shape, OpenAPI) and start listening. All
 * business logic lives in feature modules.
 */
async function bootstrap(): Promise<void> {
  // platform-express is the default HTTP adapter (installed explicitly).
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Fitness API")
    .setDescription("HTTP API for the fitness platform.")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/v1/docs", app, document);

  const config = app.get(ConfigService<Env, true>);
  const port = config.get("PORT", { infer: true });
  await app.listen(port);

  app.get(Logger).log(`API listening on http://localhost:${port}/api/v1`);
}

void bootstrap();
