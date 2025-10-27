import { ForbiddenException, Injectable } from '@nestjs/common';
import { NotFoundRecordException } from 'src/common/errors/error';
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/common/helpers/helpers';
import { CommonRoleRepository } from 'src/common/repositories/common-role.repo';
import { CommonUserRepository } from 'src/common/repositories/common-user.repo';
import { HashingService } from 'src/common/services/hasing.service';
import { RoleName } from 'src/constants/role.constant';
import { UserRepo } from 'src/modules/user/user.repo';
import {
  CreateUserBodyType,
  GetUsersQueryType,
  UpdateUserBodyType,
} from 'src/modules/user/user.schema';
import {
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException,
  UserHasSoftDeletedException,
} from './user.erorr';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepo,
    private hashingService: HashingService,
    private commondUserRepository: CommonUserRepository,
    private commondRoleRepository: CommonRoleRepository,
  ) {}

  list(pagination: GetUsersQueryType) {
    return this.userRepo.list(pagination);
  }

  async findById(id: string) {
    const user =
      await this.commondUserRepository.findUniqueIncludeRolePermissions({
        id,
        deletedAt: null,
      });
    if (!user) {
      throw NotFoundRecordException;
    }
    return user;
  }

  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserBodyType;
    createdById: string;
    createdByRoleName: string;
  }) {
    try {
      // Chỉ có admin agent mới có quyền tạo user với role là admin
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId,
      });
      // Kiểm tra xem email đã tồn tại chưa
      const getUser = await this.commondUserRepository.findUserByEmail(
        data.email,
      );
      // Nếu email đã tồn tại và chưa bị xóa thì throw lỗi
      if (getUser?.deletedAt !== null && getUser) {
        throw UserHasSoftDeletedException;
      }
      // Hash the password
      const hashedPassword = await this.hashingService.hash(data.password);
      const user = await this.userRepo.create({
        createdById,
        data: {
          ...data,
          password: hashedPassword,
        },
      });
      return user;
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException;
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException;
      }
      throw error;
    }
  }

  /**
   * Function này kiểm tra xem người thực hiện có quyền tác động đến người khác không.
   * Vì chỉ có người thực hiện là admin role mới có quyền sau: Tạo admin user, update roleId thành admin, xóa admin user.
   * Còn nếu không phải admin thì không được phép tác động đến admin
   */
  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    // Agent là admin thì cho phép
    if (roleNameAgent === RoleName.Admin) {
      return true;
    } else {
      // Agent không phải admin thì roleIdTarget phải khác admin
      const adminRoleId = await this.commondRoleRepository.getAdminRoleId();
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException();
      }
      return true;
    }
  }

  async update({
    id,
    data,
    updatedById,
    updatedByRoleName,
  }: {
    id: string;
    data: UpdateUserBodyType;
    updatedById: string;
    updatedByRoleName: string;
  }) {
    try {
      // Không thể cập nhật chính mình
      this.verifyYourself({
        userAgentId: updatedById,
        userTargetId: id,
      });

      // Lấy roleId ban đầu của người được update để kiểm tra xem liệu người update có quyền update không
      // Không dùng data.roleId vì dữ liệu này có thể bị cố tình truyền sai
      const roleIdTarget = await this.getRoleIdByUserId(id);
      await this.verifyRole({
        roleNameAgent: updatedByRoleName,
        roleIdTarget,
      });

      const updatedUser = await this.commondUserRepository.update(
        { id, deletedAt: null },
        {
          ...data,
          updatedById,
        },
      );
      return updatedUser;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException;
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException;
      }
      throw error;
    }
  }

  private async getRoleIdByUserId(userId: string) {
    const currentUser = await this.commondUserRepository.findUnique({
      id: userId,
      deletedAt: null,
    });
    if (!currentUser) {
      throw NotFoundRecordException;
    }
    return currentUser.roleId;
  }

  private verifyYourself({
    userAgentId,
    userTargetId,
  }: {
    userAgentId: string;
    userTargetId: string;
  }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException;
    }
  }

  async delete({
    id,
    deletedById,
    deletedByRoleName,
    hardDelete,
  }: {
    id: string;
    deletedById: string;
    deletedByRoleName: string;
    hardDelete: boolean;
  }) {
    try {
      // Không thể xóa chính mình
      this.verifyYourself({
        userAgentId: deletedById,
        userTargetId: id,
      });

      const roleIdTarget = await this.getRoleIdByUserId(id);
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget,
      });

      if (hardDelete) {
        await this.userRepo.delete(
          {
            id,
            deletedById,
          },
          true,
        );
      } else {
        await this.userRepo.delete({
          id,
          deletedById,
        });
      }
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
}
