import { Injectable } from '@nestjs/common';
import { UserType } from 'src/common/schemas/common-user.schema';
import { PrismaService } from 'src/common/services/prisma.service';
import {
  CreateUserBodyType,
  GetUsersQueryType,
  GetUsersResType,
} from 'src/modules/user/user.schema';

@Injectable()
export class UserRepo {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: GetUsersQueryType): Promise<GetUsersResType> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
        include: {
          role: true,
        },
      }),
    ]);
    return {
      result: data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    };
  }

  create({
    createdById,
    data,
  }: {
    createdById: string | null;
    data: CreateUserBodyType;
  }): Promise<UserType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById,
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
  ): Promise<UserType> {
    return isHard
      ? this.prismaService.user.delete({
          where: {
            id,
          },
        })
      : this.prismaService.user.update({
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
