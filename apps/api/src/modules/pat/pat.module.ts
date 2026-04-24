import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PATService } from './pat.service';
import { PATGuard } from './guards/pat.guard';
import { PATController } from './pat.controller';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
  providers: [PATService, PATGuard],
  controllers: [PATController],
  exports: [PATGuard, PATService],
})
export class PATModule {}
