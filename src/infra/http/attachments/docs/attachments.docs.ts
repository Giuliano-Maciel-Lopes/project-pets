import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const UploadAttachmentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Upload de arquivo (JPEG, PNG ou WebP — máx 10 MB)' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } }),
    ApiResponse({ status: 201, description: 'Arquivo enviado com sucesso' }),
    ApiResponse({ status: 400, description: 'Arquivo inválido ou não enviado' }),
  );
