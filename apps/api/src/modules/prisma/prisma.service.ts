import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Env } from "../../config/env.schema";
import { PrismaClient } from "../../generated/prisma/client";

/** node-postgres pool sizing for a single API instance. Tune per deploy. */
const POOL_MAX_CONNECTIONS = 10;
const POOL_IDLE_TIMEOUT_MS = 30_000;
const POOL_CONNECTION_TIMEOUT_MS = 10_000;

/**
 * Prisma 7 client wired to Postgres through the node-postgres driver adapter.
 * Targets Neon's POOLED endpoint; node-postgres issues unnamed prepared
 * statements, which are safe under PgBouncer transaction pooling.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<Env, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get("DATABASE_URL", { infer: true }),
      max: POOL_MAX_CONNECTIONS,
      idleTimeoutMillis: POOL_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: POOL_CONNECTION_TIMEOUT_MS,
    });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log("Connected to PostgreSQL");
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Lightweight DB liveness probe used by the readiness endpoint. */
  async ping(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }
}
