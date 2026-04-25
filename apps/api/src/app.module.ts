import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import type { Request } from 'express';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PATModule } from './modules/pat/pat.module';

const THROTTLE_WINDOW_MS = 60_000;

function buildThrottleMessage(
  requestPath: string | undefined,
  waitSeconds: number,
) {
  if (requestPath?.includes('/auth/login')) {
    return `Too many login attempts. Please wait ${waitSeconds} seconds before trying again. Limit: 5 attempts per minute.`;
  }

  if (requestPath?.includes('/auth/signup')) {
    return `Too many signup attempts. Please wait ${waitSeconds} seconds before trying again. Limit: 3 attempts per minute.`;
  }

  return `Too many requests. Please wait ${waitSeconds} seconds before trying again. Limit: 20 requests per minute.`;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: THROTTLE_WINDOW_MS,
          limit: 20,
        },
      ],
      errorMessage: (context, throttlerLimitDetail) => {
        const request = context.switchToHttp().getRequest<Request>();
        const requestPath =
          request.route?.path ?? request.originalUrl ?? request.url;
        const waitSeconds = Math.max(
          1,
          Math.ceil(
            (throttlerLimitDetail.timeToBlockExpire ||
              throttlerLimitDetail.timeToExpire) / 1000,
          ),
        );

        return buildThrottleMessage(requestPath, waitSeconds);
      },
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    PATModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
