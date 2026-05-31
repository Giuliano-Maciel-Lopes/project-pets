import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const NotFoundResponse = (entity = 'Recurso') =>
  ApiResponse({ status: 404, description: `${entity} não encontrado` });

export const ForbiddenResponse = () =>
  ApiResponse({ status: 403, description: 'Sem permissão' });

export const ConflictResponse = (description = 'Conflito') =>
  ApiResponse({ status: 409, description });

export const UuidParam = (name = 'id') =>
  ApiParam({ name, description: `UUID — ${name}` });

export const PaginationQueries = () =>
  applyDecorators(
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 25 }),
  );

export const AdminOperation = (summary: string) =>
  applyDecorators(
    ApiOperation({ summary }),
    ForbiddenResponse(),
  );
