import { Module } from '@nestjs/common';
import { AuthRepository } from 'src/modules/auth/auth.repo';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleService } from './google.service';

@Module({
  providers: [AuthService, AuthRepository, GoogleService],
  controllers: [AuthController],
})
export class AuthModule {}
