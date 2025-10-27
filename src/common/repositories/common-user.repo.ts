import { Injectable } from '@nestjs/common';
import { PermissionType } from '../schemas/common-permission.schema';
import { RoleType } from '../schemas/common-role.schema';
import { UserType } from '../schemas/common-user.schema';
import { PrismaService } from '../services/prisma.service';

type UserIncludeRolePermissionsType = UserType & {
  role: RoleType & { permissions: PermissionType[] };
};

export type WhereUniqueUserType =
  | { id: string; deletedAt?: null }
  | { email: string; deletedAt?: null };

@Injectable()
export class CommonUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  findUniqueIncludeRolePermissions(
    where: WhereUniqueUserType,
  ): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }
  update(
    where: { id: string; deletedAt?: null },
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
  findUserByEmail(email: string): Promise<UserType | null> {
    return this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
  }
}
