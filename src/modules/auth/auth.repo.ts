import { Injectable } from '@nestjs/common';
import { TypeOfVerificationCodeType } from 'src/constants/auth.constant';

import { WhereUniqueUserType } from 'src/common/repositories/common-user.repo';
import { UserType } from 'src/common/schemas/common-user.schema';
import { PrismaService } from 'src/common/services/prisma.service';
import {
  DeviceType,
  RefreshTokenType,
  RoleType,
  VerificationCodeType,
} from 'src/modules/auth/auth.schema';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Pick<UserType, 'email' | 'name' | 'password' | 'phone' | 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    const users = await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });

    return users;
  }

  async createUserInclueRole(
    user: Pick<
      UserType,
      'email' | 'name' | 'password' | 'phone' | 'avatar' | 'roleId'
    >,
  ): Promise<UserType & { role: RoleType }> {
    return this.prismaService.user.create({
      data: user,
      include: {
        role: true,
      },
    });
  }

  createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
    deviceId: string;
  }) {
    return this.prismaService.refreshToken.create({
      data,
    });
  }

  async findUniqueUserIncludeRole(
    where: WhereUniqueUserType,
  ): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });
  }

  async createVerificationCode(
    payload: Pick<
      VerificationCodeType,
      'email' | 'type' | 'code' | 'expiresAt'
    >,
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.upsert({
      where: {
        email_code_type: {
          email: payload.email,
          code: payload.code,
          type: payload.type,
        },
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    });
  }
  async findUniqueVerificationCode(
    uniqueValue:
      | { id: string }
      | {
          email_code_type: {
            email: string;
            code: string;
            type: TypeOfVerificationCodeType;
          };
        },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    });
  }
  createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> &
      Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return this.prismaService.device.create({
      data,
    });
  }
  async findUniqueRefreshTokenIncludeUserRole(where: {
    token: string;
  }): Promise<
    (RefreshTokenType & { user: UserType & { role: RoleType } }) | null
  > {
    return this.prismaService.refreshToken.findUnique({
      where,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }
  updateDevice(
    deviceId: string,
    data: Partial<DeviceType>,
  ): Promise<DeviceType> {
    return this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data,
    });
  }
  deleteRefreshToken(where: { token: string }): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where,
    });
  }

  deleteVerificationCode(
    uniqueValue:
      | { id: string }
      | {
          email_code_type: {
            email: string;
            code: string;
            type: TypeOfVerificationCodeType;
          };
        },
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.delete({
      where: uniqueValue,
    });
  }
  update(
    where: { id: string },
    data: Partial<UserType>,
  ): Promise<UserType | null> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null,
      },
      data,
    });
  }
}
