import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AdminOperation, ForbiddenResponse, NotFoundResponse, UuidParam } from '@/infra/docs/common.docs';

export const AuthenticateDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Autenticar usuário', description: 'Retorna accessToken no body e seta cookie httpOnly. No Swagger, copie o accessToken e clique em Authorize.' }),
    ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'admin@pets.com' }, password: { type: 'string', example: '123456' } }, required: ['email', 'password'] } }),
    ApiResponse({ status: 200, schema: { example: { message: 'Autenticado com sucesso', accessToken: 'eyJ...' } }, description: 'Autenticado com sucesso' }),
    ApiResponse({ status: 401, description: 'Email ou senha inválidos' }),
  );

export const LogoutDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Logout — limpa o cookie de sessão' }),
    ApiResponse({ status: 200, description: 'Logout realizado com sucesso' }),
  );

export const CreateUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Criar usuário' }),
    ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'João Silva' }, email: { type: 'string', example: 'joao@email.com' }, password: { type: 'string', example: '123456' } }, required: ['name', 'email', 'password'] } }),
    ApiResponse({ status: 201, description: 'Usuário criado com sucesso' }),
    ApiResponse({ status: 409, description: 'Email já cadastrado' }),
  );

export const FindUserByEmailDocs = () =>
  applyDecorators(
    AdminOperation('Buscar usuário por email (ADMIN)'),
    ApiParam({ name: 'email', example: 'joao@email.com' }),
    ApiResponse({ status: 200, description: 'Usuário encontrado' }),
    NotFoundResponse('Usuário'),
  );

export const FindUserByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Buscar usuário por ID (próprio ou ADMIN)' }),
    UuidParam(),
    ApiResponse({ status: 200, description: 'Usuário encontrado' }),
    ForbiddenResponse(),
    NotFoundResponse('Usuário'),
  );
