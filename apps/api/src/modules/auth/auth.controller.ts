import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.signup(signupDto);
    this.setRefreshTokenCookie(
      response,
      auth.refreshToken,
      auth.refreshTokenExpiresAt,
    );

    return {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      tokenType: auth.tokenType,
      accessTokenExpiresIn: auth.accessTokenExpiresIn,
      user: auth.user,
    };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.login(loginDto);
    this.setRefreshTokenCookie(
      response,
      auth.refreshToken,
      auth.refreshTokenExpiresAt,
    );

    return {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      tokenType: auth.tokenType,
      accessTokenExpiresIn: auth.accessTokenExpiresIn,
      user: auth.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken as string | undefined;
    const auth = await this.authService.refresh(refreshToken);
    this.setRefreshTokenCookie(
      response,
      auth.refreshToken,
      auth.refreshTokenExpiresAt,
    );

    return {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      tokenType: auth.tokenType,
      accessTokenExpiresIn: auth.accessTokenExpiresIn,
      user: auth.user,
    };
  }

  @Post('session')
  @HttpCode(200)
  async session(@Req() request: Request) {
    const refreshToken = request.cookies?.refreshToken as string | undefined;
    const user = await this.authService.getSessionUser(refreshToken);

    return {
      authenticated: Boolean(user),
      user,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken as string | undefined;
    await this.authService.logout(refreshToken);
    this.clearRefreshTokenCookie(response);

    return { success: true };
  }

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
    refreshTokenExpiresAt: Date,
  ) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth',
      expires: refreshTokenExpiresAt,
    });
  }

  private clearRefreshTokenCookie(response: Response) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  }
}
