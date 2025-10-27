import { Injectable } from '@nestjs/common';
import { NotFoundRecordException } from 'src/common/errors/error';
import { isUniqueConstraintPrismaError } from 'src/common/helpers/helpers';
import { CommonUserRepository } from 'src/common/repositories/common-user.repo';
import { HashingService } from 'src/common/services/hasing.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { InvalidPasswordException } from './profile.error';
import {
  ChangePasswordBodyType,
  UpdateProfileBodyType,
} from './profile.schema';

@Injectable()
export class ProfileRepo {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonUserRepo: CommonUserRepository,
    private readonly hashingService: HashingService,
    private readonly commonUserRepository: CommonUserRepository,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return profile;
  }

  async update(userId: string, body: UpdateProfileBodyType) {
    const profile = await this.prisma.user.update({
      where: { id: userId },
      data: body,
    });
    return profile;
  }

  async changePassword(
    userId: string,
    body: Omit<ChangePasswordBodyType, 'confirmNewPassword'>,
  ) {
    try {
      const { password, newPassword } = body;
      const user = await this.commonUserRepo.findUnique({
        id: userId,
      });
      if (!user) {
        throw NotFoundRecordException;
      }
      const isPasswordMatch = await this.hashingService.compare(
        password,
        user.password,
      );
      if (!isPasswordMatch) {
        throw InvalidPasswordException;
      }
      const hashedPassword = await this.hashingService.hash(newPassword);

      await this.commonUserRepository.update(
        { id: userId },
        {
          password: hashedPassword,
          updatedById: userId,
        },
      );
      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }
}
