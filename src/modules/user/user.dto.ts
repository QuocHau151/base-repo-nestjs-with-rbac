import { createZodDto } from 'nestjs-zod';
import { UpdateProfileResDTO } from 'src/common/dto/common-user.dto';
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  GetUsersQuerySchema,
  GetUsersResSchema,
  UpdateUserBodySchema,
} from 'src/modules/user/user.schema';
import { z } from 'zod';

export class GetUsersResDTO extends createZodDto(
  z.object({
    data: GetUsersResSchema,
    statusCode: z.number(),
  }),
) {}

export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}

export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}

export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}

export class CreateUserResDTO extends UpdateProfileResDTO {}
