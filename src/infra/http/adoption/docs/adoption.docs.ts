import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminOperation, ForbiddenResponse, NotFoundResponse, PaginationQueries, UuidParam } from '@/infra/docs/common.docs';

export const CreateAdoptionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Solicitar adoção', description: 'O próprio adotante ou um ADMIN podem criar. O candidato não pode estar banido e o pet deve estar disponível.' }),
    ApiBody({ schema: { type: 'object', properties: { petId: { type: 'string', example: 'uuid-do-pet' }, adopterId: { type: 'string', example: 'uuid-do-candidato' }, unityId: { type: 'string', example: 'uuid-da-unidade' } }, required: ['petId', 'adopterId', 'unityId'] } }),
    ApiResponse({ status: 201, description: 'Adoção criada com sucesso' }),
    ForbiddenResponse(),
    ApiResponse({ status: 422, description: 'Pet indisponível ou unidade inválida' }),
  );

export const StatusAdoptionDocs = () =>
  applyDecorators(
    AdminOperation('Atualizar status da adoção (ADMIN)'),
    UuidParam(),
    ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], example: 'APPROVED' } }, required: ['status'] } }),
    ApiResponse({ status: 200, description: 'Status atualizado' }),
    NotFoundResponse('Adoção'),
  );

export const FindAdoptionByIdDocs = () =>
  applyDecorators(
    AdminOperation('Buscar adoção por ID (ADMIN)'),
    UuidParam(),
    ApiResponse({ status: 200, description: 'Adoção encontrada' }),
    NotFoundResponse('Adoção'),
  );

export const ListAdoptionsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar adoções' }),
    ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] }),
    ApiQuery({ name: 'adopterId', required: false, description: 'UUID do candidato' }),
    ApiQuery({ name: 'petId', required: false, description: 'UUID do pet' }),
    ApiQuery({ name: 'unityId', required: false, description: 'UUID da unidade' }),
    PaginationQueries(),
    ApiResponse({ status: 200, description: 'Lista de adoções' }),
  );
