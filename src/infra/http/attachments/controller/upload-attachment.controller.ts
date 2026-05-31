import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
import { FileInterceptor } from '@nestjs/platform-express';
import { ServiceCreateAttachment } from '@/domain/Attachment/application/services/create-attachment-service';
import { AttachmentPresenter } from '../presenters/attachment-presenter';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UploadAttachmentDocs } from '../docs/attachments.docs';

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
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
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

    const result = await this.createAttachment.execute({
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    });

    if (result.isLeft()) throw result.value;

    return { attachment: AttachmentPresenter.toHTTP(result.value.attachment) };
  }
}
