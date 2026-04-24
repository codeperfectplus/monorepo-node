import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { Role } from '../decorators/roles.decorator';

type JwtAccessPayload = {
  sub: string;
  email: string;
  role: Role;
  exp: number;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing access token.');
    }

    const secret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      'dev-access-secret-change-me';

    try {
      const payload = await this.jwtService.verifyAsync<JwtAccessPayload>(
        token,
        { secret },
      );
      (request as Request & { user: JwtAccessPayload }).user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    return true;
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
