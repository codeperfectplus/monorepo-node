import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

type AuthUserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  accessTokenExpiresIn: string;
  refreshTokenExpiresAt: Date;
  user: AuthUserResponse;
};

type JwtPayload = {
  sub: string;
  email: string;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const email = signupDto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    const firstName = signupDto.firstName.trim();
    const lastName = signupDto.lastName.trim();
    const fullName = signupDto.name?.trim() || `${firstName} ${lastName}`;
    const passwordHash = await hash(signupDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        name: fullName,
        email,
        passwordHash,
      },
    });

    return this.issueTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const email = loginDto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return this.issueTokens(updatedUser);
  }

  async refresh(refreshToken: string | undefined): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token.');
    }

    const refreshSecret = this.getJwtSecret(
      'JWT_REFRESH_SECRET',
      'dev-refresh-secret-change-me',
    );

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (
      user.refreshTokenExpiresAt &&
      user.refreshTokenExpiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Refresh token has expired.');
    }

    const isTokenMatch = await compare(refreshToken, user.refreshTokenHash);
    if (!isTokenMatch) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return this.issueTokens(user);
  }

  private signAccessToken(userId: string, email: string): Promise<string> {
    const accessSecret = this.getJwtSecret(
      'JWT_ACCESS_SECRET',
      'dev-access-secret-change-me',
    );
    const accessTokenExpiresIn =
      (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m') as StringValue;

    return this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: accessSecret,
        expiresIn: accessTokenExpiresIn,
      },
    );
  }

  private signRefreshToken(userId: string, email: string): Promise<string> {
    const refreshSecret = this.getJwtSecret(
      'JWT_REFRESH_SECRET',
      'dev-refresh-secret-change-me',
    );
    const refreshTokenExpiresIn =
      (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as StringValue;

    return this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: refreshSecret,
        expiresIn: refreshTokenExpiresIn,
      },
    );
  }

  private async issueTokens(user: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<AuthResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user.id, user.email),
      this.signRefreshToken(user.id, user.email),
    ]);

    const refreshTokenHash = await hash(refreshToken, 12);
    const refreshTokenExpiresAt = this.extractTokenExpiry(refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash,
        refreshTokenExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      accessTokenExpiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      refreshTokenExpiresAt,
      user: this.toAuthUserResponse(user),
    };
  }

  private extractTokenExpiry(token: string): Date {
    const decoded = this.jwtService.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }

    const fallbackExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return new Date(fallbackExpiry);
  }

  private getJwtSecret(
    key: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET',
    fallback: string,
  ): string {
    const configuredSecret = this.configService.get<string>(key);
    if (configuredSecret) {
      return configuredSecret;
    }

    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new Error(`${key} is required in production.`);
    }

    return fallback;
  }

  private toAuthUserResponse(user: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuthUserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
