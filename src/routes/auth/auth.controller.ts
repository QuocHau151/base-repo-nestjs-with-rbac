import { Body, Controller, Get, Ip, Post, Query, Res } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { Response } from 'express';

import { AuthService } from 'src/routes/auth/auth.service';
import {
  DisableTwoFactorBodyDTO,
  ForgotPasswordBodyDTO,
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOPTBodyDTO,
  TwoFactorSetupResDTO,
} from './auth.dto';
import { IsPublic } from 'src/common/decorators/auth.decorator';
import { UserAgent } from 'src/common/decorators/user-agent.decorator';
import { MessageResDTO } from 'src/common/dtos/response.dto';
import { GoogleService } from './google.service';
import envConfig from 'src/configs/config';
import { EmptyBodyDTO } from 'src/common/dtos/request.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('register')
  @IsPublic()
  // ZodSerializerDto === TransformInterceptor DTO RESPONSE ở app.module.ts
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body);
  }
  @Post('otp')
  @IsPublic()
  sendOTP(@Body() body: SendOPTBodyDTO) {
    return this.authService.sendOTP(body);
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  login(
    @Body() body: LoginBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    });
  }
  @Post('refresh-token')
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResDTO)
  refreshToken(
    @Body() body: RefreshTokenBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip,
    });
  }
  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken);
  }
  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({
      userAgent,
      ip,
    });
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.googleService.googleCallback({
        code,
        state,
      });
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập bằng Google, vui lòng thử lại bằng cách khác';
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`,
      );
    }
  }
  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body);
  }

  @Post('2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResDTO)
  setupTwoFactorAuth(
    @Body() _: EmptyBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.authService.setupTwoFactorAuth(userId);
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResDTO)
  disableTwoFactorAuth(
    @Body() body: DisableTwoFactorBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.authService.disableTwoFactorAuth({
      ...body,
      userId,
    });
  }
}
