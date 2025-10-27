import { Injectable } from '@nestjs/common';
import { NotFoundRecordException } from 'src/common/errors/error';
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/common/helpers/helpers';
import { RoleName } from 'src/constants/role.constant';
import {
  ProhibitedActionOnBaseRoleException,
  RoleAlreadyExistsException,
} from './role.error';
import { RoleRepo } from './role.repo';
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  UpdateRoleBodyType,
} from './role.schema';

@Injectable()
export class RoleService {
  constructor(private roleRepo: RoleRepo) {}

  async list(pagination: GetRolesQueryType) {
    const data = await this.roleRepo.list(pagination);
    return data;
  }

  async findById(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw NotFoundRecordException;
    }
    return role;
  }

  async create({
    data,
    createdById,
  }: {
    data: CreateRoleBodyType;
    createdById: string;
  }) {
    try {
      const role = await this.roleRepo.create({
        createdById,
        data,
      });
      return role;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  /**
   * Kiểm tra xem role có phải là 1 trong 3 role cơ bản không
   */
  private async verifyRole(roleId: string) {
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw NotFoundRecordException;
    }
    const baseRoles: string[] = [
      RoleName.Admin,
      RoleName.Client,
      RoleName.Seller,
    ];

    if (baseRoles.includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException;
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string;
    data: UpdateRoleBodyType;
    updatedById: string;
  }) {
    try {
      // Kiểm tra xem role có phải là 1 trong 3 role cơ bản không
      await this.verifyRole(id);

      const updatedRole = await this.roleRepo.update({
        id,
        updatedById,
        data,
      });
      return updatedRole;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async delete({ id, deletedById }: { id: string; deletedById: string }) {
    try {
      await this.verifyRole(id);
      await this.roleRepo.delete({
        id,
        deletedById,
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
}
