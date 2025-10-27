import { Global, Module } from '@nestjs/common';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './@system/filters/http-exception.filter';
import { AccessTokenGuard } from './@system/guards/access-token.guard';
import { APIKeyGuard } from './@system/guards/api-key.guard';
import { AuthenticationGuard } from './@system/guards/authentication.guard';
import { TransformInterceptor } from './@system/interceptors/transform.interceptor';
import CustomZodValidationPipe from './@system/pipes/custom-zod-validation.pipe';
import { CommonRoleRepository } from './common/repositories/common-role.repo';
import { CommonUserRepository } from './common/repositories/common-user.repo';
import { TwoFactorService } from './common/services/2fa.service';
import { EmailService } from './common/services/email.service';
import { HashingService } from './common/services/hasing.service';
import { PrismaService } from './common/services/prisma.service';
import { TokenService } from './common/services/token.service';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';

// Các service dùng chung trong toàn bộ ứng dụng
const commonServices = [
  PrismaService,
  HashingService,
  TokenService,
  CommonUserRepository,
  CommonRoleRepository,
  EmailService,
  TwoFactorService,
];

@Global()
@Module({
  imports: [
    JwtModule,
    AuthModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    ...commonServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: commonServices,
})
export class AppModule {}
