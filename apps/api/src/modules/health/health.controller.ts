import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller()
export class HealthController {
  /** Liveness: the process is up and serving. */
  @Get("health")
  @ApiOkResponse({ description: "Service is alive." })
  health(): { status: "ok"; timestamp: string } {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  /**
   * Readiness: the service is ready to accept traffic. No external
   * dependencies yet — this gains a real DB check in the Prisma task.
   */
  @Get("ready")
  @ApiOkResponse({ description: "Service is ready to accept traffic." })
  ready(): { status: "ready" } {
    return { status: "ready" };
  }
}
