import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  GetUserProfileResSchema,
  UpdateProfileResSchema,
} from '../schemas/common-user.schema';

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export class GetUserProfileResDTO extends createZodDto(
  z.object({
    data: GetUserProfileResSchema,
    statusCode: z.number(),
  }),
) {}

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export class UpdateProfileResDTO extends createZodDto(
  z.object({
    data: UpdateProfileResSchema,
    statusCode: z.number(),
  }),
) {}
