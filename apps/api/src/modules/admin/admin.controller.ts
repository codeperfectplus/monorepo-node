import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  @Get()
  getDashboard(@CurrentUser() user: CurrentUserPayload) {
    return { message: `Welcome to the admin panel, ${user.email}!`, user };
  }
}
