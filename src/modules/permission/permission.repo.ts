import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  PermissionType,
  UpdatePermissionBodyType,
} from 'src/modules/permission/permission.schema';

@Injectable()
export class PermissionRepo {
  constructor(private prismaService: PrismaService) {}

  async list(
    pagination: GetPermissionsQueryType,
  ): Promise<GetPermissionsResType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),
    ]);
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    };
  }

  findById(id: string): Promise<PermissionType | null> {
    return this.prismaService.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: string | null;
    data: CreatePermissionBodyType;
  }): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  update({
    id,
    updatedById,
    data,
  }: {
    id: string;
    updatedById: string;
    data: UpdatePermissionBodyType;
  }): Promise<PermissionType> {
    return this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  delete(
    {
      id,
      deletedById,
    }: {
      id: string;
      deletedById: string;
    },
    isHard?: boolean,
  ): Promise<PermissionType> {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id,
          },
        })
      : this.prismaService.permission.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        });
  }
}
