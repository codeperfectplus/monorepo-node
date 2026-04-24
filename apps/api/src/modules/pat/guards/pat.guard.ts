import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PATService } from '../pat.service';

@Injectable()
export class PATGuard implements CanActivate {
  constructor(private readonly patService: PATService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing personal access token.');
    }

    const result = await this.patService.validate(token);

    if (!result) {
      throw new UnauthorizedException('Invalid or expired personal access token.');
    }

    // Attach a CurrentUserPayload-compatible object so @CurrentUser() works
    (request as Request & { user: unknown }).user = {
      sub: result.userId,
      email: result.email,
      role: result.role,
      exp: Math.floor(result.expiresAt.getTime() / 1000),
    };

    return true;
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
