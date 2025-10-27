import { createZodDto } from 'nestjs-zod';
import { EmptyBodySchema } from '../schemas/request.schema';

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
