import { HTTPMethod } from 'src/constants/http-method.constant';
import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string().max(500),
  description: z.string(),
  path: z.string().max(1000),
  module: z.string().max(500),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
  deletedById: z.string().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type PermissionType = z.infer<typeof PermissionSchema>;
