import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MessageResSchema } from '../schemas/response.schema';

export class MessageResDTO extends createZodDto(
  z.object({
    data: MessageResSchema,
    statusCode: z.number(),
  }),
) {}
