import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminOperation, ForbiddenResponse, NotFoundResponse, PaginationQueries, UuidParam } from '@/infra/docs/common.docs';

export const CreateAdoptionCandidateDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Cadastrar candidato a adotante' }),
    ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'joao@email.com' }, name: { type: 'string', example: 'João Silva' }, cpf: { type: 'string', example: '123.456.789-09' }, phone: { type: 'string', example: '11999999999' }, identityUrl: { type: 'string', example: 'https://storage/rg.pdf' } }, required: ['email', 'name', 'cpf', 'phone', 'identityUrl'] } }),
    ApiResponse({ status: 201, description: 'Candidato criado com sucesso' }),
    ForbiddenResponse(),
  );

export const UpdateAdoptionCandidateDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Atualizar candidato (próprio ou ADMIN)' }),
    UuidParam(),
    ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'João Silva' }, phone: { type: 'string', example: '11999999999' }, identityUrl: { type: 'string', example: 'https://storage/rg.pdf' } }, required: ['name', 'phone', 'identityUrl'] } }),
    ApiResponse({ status: 200, description: 'Candidato atualizado com sucesso' }),
    ForbiddenResponse(),
    NotFoundResponse('Candidato'),
  );

export const BanAdoptionCandidateDocs = () =>
  applyDecorators(
    AdminOperation('Banir/desbanir candidato (ADMIN)'),
    UuidParam(),
    ApiBody({ schema: { type: 'object', properties: { isBanned: { type: 'boolean', example: true }, bannedReason: { type: 'string', example: 'Histórico de maus tratos' } }, required: ['isBanned', 'bannedReason'] } }),
    ApiResponse({ status: 200, description: 'Candidato atualizado' }),
    NotFoundResponse('Candidato'),
  );

export const FindAdoptionCandidateByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Buscar candidato por ID (próprio ou ADMIN)' }),
    UuidParam(),
    ApiResponse({ status: 200, description: 'Candidato encontrado' }),
    ForbiddenResponse(),
    NotFoundResponse('Candidato'),
  );

export const ListAdoptionCandidatesDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar candidatos a adotante' }),
    ApiQuery({ name: 'name', required: false }),
    ApiQuery({ name: 'cpf', required: false }),
    ApiQuery({ name: 'isBanned', required: false, enum: ['true', 'false'] }),
    PaginationQueries(),
    ApiResponse({ status: 200, description: 'Lista de candidatos' }),
    ForbiddenResponse(),
  );
