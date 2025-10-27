import { Injectable } from '@nestjs/common';

import { NotFoundRecordException } from 'src/common/errors/error';
import { CommonUserRepository } from 'src/common/repositories/common-user.repo';
import { ProfileRepo } from './profile.repo';
import {
  ChangePasswordBodyType,
  UpdateProfileBodyType,
} from './profile.schema';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepo,
    private readonly commonUserRepository: CommonUserRepository,
  ) {}

  async getProfile(userId: string) {
    const user =
      await this.commonUserRepository.findUniqueIncludeRolePermissions({
        id: userId,
      });

    if (!user) {
      throw NotFoundRecordException;
    }

    return user;
  }

  async updateProfile(userId: string, body: UpdateProfileBodyType) {
    const user = await this.profileRepo.update(userId, body);
    return user;
  }

  async changePassword(userId: string, body: ChangePasswordBodyType) {
    const user = await this.profileRepo.changePassword(userId, body);
    return user;
  }
}
