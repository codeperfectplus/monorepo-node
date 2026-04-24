import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PATGuard } from './guards/pat.guard';
import { PATService } from './pat.service';
import { CreatePatDto } from './dto/create-pat.dto';

@Controller('tokens')
export class PATController {
  constructor(private readonly patService: PATService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePatDto,
  ) {
    const { plainToken, record } = await this.patService.create(user.sub, dto);
    return {
      token: plainToken,
      id: record.id,
      name: record.name,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      // Token is shown exactly once — store it immediately
      message:
        'Copy this token now. It will not be shown again.',
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.patService.list(user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async revoke(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') tokenId: string,
  ) {
    await this.patService.revoke(user.sub, tokenId);
  }

  // Test endpoint — only accessible with a valid PAT in Authorization: Bearer pat_...
  @Get('test')
  @UseGuards(PATGuard)
  testWithPat(@CurrentUser() user: CurrentUserPayload) {
    return {
      message: `Authenticated via PAT as ${user.email}`,
      userId: user.sub,
      email: user.email,
      role: user.role,
    };
  }
}
