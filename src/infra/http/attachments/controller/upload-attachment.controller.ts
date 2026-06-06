import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServiceCreateAttachment } from '@/domain/Attachment/application/services/create-attachment-service';
import { AttachmentPresenter } from '../presenters/attachment-presenter';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UploadAttachmentDocs } from '../docs/attachments.docs';

interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function detectMimeFromBuffer(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp';
  return null;
}

@ApiTags('Attachments')
@ApiBearerAuth('JWT')
@Controller('/attachments')
export class ControllerUploadAttachment {
  constructor(private createAttachment: ServiceCreateAttachment) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 10 },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @UploadAttachmentDocs()
  async handle(@UploadedFile() file: MulterFile) {
    if (!file) throw new BadRequestException('Arquivo não enviado');

    const detectedMime = detectMimeFromBuffer(file.buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      throw new BadRequestException('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
    }

    const result = await this.createAttachment.execute({
      fileName: file.originalname,
      fileType: detectedMime,
      body: file.buffer,
    });

    if (result.isLeft()) throw new BadRequestException('Erro ao processar o arquivo.');

    return { attachment: AttachmentPresenter.toHTTP(result.value.attachment) };
  }
}
