import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { ApiResponse, User } from '@shared/types';
import { formatDate } from '@shared/utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }

  // dummpy API endpoint to return a user object
  @Get('user')
  getUser(): ApiResponse<User> {
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    return {
      data: user,
      message: `User created on ${formatDate(user.createdAt)}`,
      success: true,
    };
  }
}
