import { Body, Controller, Get, Put } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ActiveUser } from 'src/@system/decorators/active-user.decorator';
import { GetUserProfileResDTO } from 'src/common/dto/common-user.dto';
import { MessageResDTO } from 'src/common/dto/response.dto';
import {
  ChangePasswordBodyDTO,
  UpdateProfileBodyDTO,
  UpdateUserProfileResDTO,
} from './profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileResDTO)
  getProfile(@ActiveUser('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @ZodSerializerDto(UpdateUserProfileResDTO)
  updateProfile(
    @ActiveUser('userId') userId: string,
    @Body() body: UpdateProfileBodyDTO,
  ) {
    return this.profileService.updateProfile(userId, body);
  }

  @Put('change-password')
  @ZodSerializerDto(MessageResDTO)
  changePassword(
    @ActiveUser('userId') userId: string,
    @Body() body: ChangePasswordBodyDTO,
  ) {
    return this.profileService.changePassword(userId, body);
  }
}
