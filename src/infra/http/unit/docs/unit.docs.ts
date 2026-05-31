import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminOperation, ConflictResponse, ForbiddenResponse, NotFoundResponse, PaginationQueries, UuidParam } from '@/infra/docs/common.docs';

const unitBody = ApiBody({
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Abrigo Centro' },
      address: { type: 'string', example: 'Rua das Flores, 123' },
      city: { type: 'string', example: 'São Paulo' },
      state: { type: 'string', example: 'SP' },
      managerId: { type: 'string', example: 'uuid-do-gerente' },
    },
    required: ['name', 'address', 'city', 'state', 'managerId'],
  },
});

export const CreateUnitDocs = () =>
  applyDecorators(
    AdminOperation('Criar unidade de abrigo (ADMIN)'),
    unitBody,
    ApiResponse({ status: 201, description: 'Unidade criada com sucesso' }),
    ConflictResponse('Nome/slug já existente'),
  );

export const UpdateUnitDocs = () =>
  applyDecorators(
    AdminOperation('Atualizar unidade (ADMIN)'),
    UuidParam(),
    unitBody,
    ApiResponse({ status: 200, description: 'Unidade atualizada com sucesso' }),
    NotFoundResponse('Unidade'),
  );

export const DeleteUnitDocs = () =>
  applyDecorators(
    AdminOperation('Deletar unidade (ADMIN)'),
    UuidParam(),
    ApiResponse({ status: 204, description: 'Unidade deletada' }),
    NotFoundResponse('Unidade'),
  );

export const ToggleActiveUnitDocs = () =>
  applyDecorators(
    AdminOperation('Ativar/desativar unidade (ADMIN)'),
    UuidParam(),
    ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean', example: true } }, required: ['isActive'] } }),
    ApiResponse({ status: 200, description: 'Status atualizado' }),
    NotFoundResponse('Unidade'),
  );

export const ListUnitsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar unidades' }),
    ApiQuery({ name: 'name', required: false }),
    ApiQuery({ name: 'city', required: false }),
    ApiQuery({ name: 'state', required: false, description: 'UF ex: SP' }),
    ApiQuery({ name: 'isActive', required: false, enum: ['true', 'false'] }),
    ApiQuery({ name: 'isPrincipal', required: false, enum: ['true', 'false'] }),
    ApiQuery({ name: 'managerId', required: false, description: 'UUID do gerente' }),
    PaginationQueries(),
    ApiResponse({ status: 200, description: 'Lista de unidades' }),
  );

export const FindUnitByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Buscar unidade por ID' }),
    UuidParam(),
    ApiResponse({ status: 200, description: 'Unidade encontrada' }),
    NotFoundResponse('Unidade'),
  );

export const FindUnitBySlugDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Buscar unidade por slug' }),
    ApiResponse({ status: 200, description: 'Unidade encontrada' }),
    NotFoundResponse('Unidade'),
  );
