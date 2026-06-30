import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("health")
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Liveness: the process is up and serving. */
  @Get("health")
  @ApiOkResponse({ description: "Service is alive." })
  health(): { status: "ok"; timestamp: string } {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  /** Readiness: the service can serve traffic — verified by pinging the DB. */
  @Get("ready")
  @ApiOkResponse({ description: "Service is ready to accept traffic." })
  @ApiServiceUnavailableResponse({
    description: "A dependency (database) is unavailable.",
  })
  async ready(): Promise<{ status: "ready" }> {
    try {
      await this.prisma.ping();
      return { status: "ready" };
    } catch (error) {
      // Surface as 503 but keep the root cause in the logs for diagnosis.
      this.logger.error(
        "Readiness check failed: database ping error",
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException("Database is not reachable");
    }
  }
}
