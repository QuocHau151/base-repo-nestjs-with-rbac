import { Injectable } from '@nestjs/common';
import { NotFoundRecordException } from 'src/common/errors/error';
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/common/helpers/helpers';
import { PrismaService } from 'src/common/services/prisma.service';
import { PermissionAlreadyExistsException } from 'src/modules/permission/permission.error';
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  UpdatePermissionBodyType,
} from 'src/modules/permission/permission.schema';

@Injectable()
export class PermissionService {
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

  async findById(id: string) {
    const permission = await this.prismaService.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    if (!permission) {
      throw NotFoundRecordException;
    }
    return permission;
  }

  async create({
    data,
    createdById,
  }: {
    data: CreatePermissionBodyType;
    createdById: string;
  }) {
    try {
      return await this.prismaService.permission.create({
        data: {
          ...data,
          createdById,
        },
      });
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string;
    data: UpdatePermissionBodyType;
    updatedById: string;
  }) {
    try {
      const permission = await this.prismaService.permission.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...data,
          updatedById,
        },
      });
      return permission;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: string; deletedById: string }) {
    try {
      await this.prismaService.permission.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedById,
        },
      });
      return {
        message: 'Delete successfully',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      throw error;
    }
  }

  hardDelete({ id }: { id: string }) {
    return this.prismaService.permission.delete({
      where: {
        id,
      },
    });
  }
}
