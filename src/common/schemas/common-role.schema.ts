import { z } from 'zod';
import { PermissionSchema } from './common-permission.schema';

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string().max(500),
  description: z.string(),
  isActive: z.boolean().default(true),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
  deletedById: z.string().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type RoleType = z.infer<typeof RoleSchema>;
export const RolePermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});
export type RolePermissionsType = z.infer<typeof RolePermissionsSchema>;
