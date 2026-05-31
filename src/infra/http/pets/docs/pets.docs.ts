import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminOperation, ForbiddenResponse, NotFoundResponse, PaginationQueries, UuidParam } from '@/infra/docs/common.docs';

const petBody = (example: object = {}) =>
  ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Rex' },
        species: { type: 'string', example: 'Cachorro' },
        breed: { type: 'string', example: 'Labrador' },
        age: { type: 'number', example: 2 },
        sex: { type: 'string', enum: ['male', 'female'] },
        unitId: { type: 'string', example: 'uuid-da-unidade' },
        attachmentIds: { type: 'array', items: { type: 'string' }, example: [] },
        ...example,
      },
      required: ['name', 'species', 'breed', 'unitId'],
    },
  });

export const CreatePetDocs = () =>
  applyDecorators(
    AdminOperation('Criar pet (ADMIN)'),
    petBody(),
    ApiResponse({ status: 201, description: 'Pet criado com sucesso' }),
  );

export const UpdatePetDocs = () =>
  applyDecorators(
    AdminOperation('Atualizar pet (ADMIN)'),
    UuidParam(),
    petBody(),
    ApiResponse({ status: 200, description: 'Pet atualizado com sucesso' }),
    NotFoundResponse('Pet'),
  );

export const DeletePetDocs = () =>
  applyDecorators(
    AdminOperation('Deletar pet (ADMIN)'),
    UuidParam(),
    ApiResponse({ status: 204, description: 'Pet deletado' }),
    NotFoundResponse('Pet'),
  );

export const ToggleActivePetDocs = () =>
  applyDecorators(
    AdminOperation('Ativar/desativar pet (ADMIN)'),
    UuidParam(),
    ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean', example: true } }, required: ['isActive'] } }),
    ApiResponse({ status: 200, description: 'Status atualizado' }),
    NotFoundResponse('Pet'),
  );

export const SetStatusPetDocs = () =>
  applyDecorators(
    AdminOperation('Atualizar status do pet (ADMIN)'),
    UuidParam(),
    ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['available', 'unavailable', 'analysis'], example: 'available' } }, required: ['status'] } }),
    ApiResponse({ status: 200, description: 'Status atualizado' }),
    NotFoundResponse('Pet'),
  );

export const ListPetsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar pets' }),
    ApiQuery({ name: 'name', required: false }),
    ApiQuery({ name: 'species', required: false }),
    ApiQuery({ name: 'breed', required: false }),
    ApiQuery({ name: 'status', required: false, enum: ['available', 'unavailable', 'analysis'] }),
    ApiQuery({ name: 'sex', required: false, enum: ['male', 'female'] }),
    ApiQuery({ name: 'isActive', required: false, enum: ['true', 'false'] }),
    ApiQuery({ name: 'unitId', required: false, description: 'UUID da unidade' }),
    PaginationQueries(),
    ApiResponse({ status: 200, description: 'Lista de pets' }),
  );

export const FindPetByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Buscar pet por ID' }),
    UuidParam(),
    ApiResponse({ status: 200, description: 'Pet encontrado' }),
    NotFoundResponse('Pet'),
  );
