import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { Attachment } from '../../enterprise/entities/attachment';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { Uploader } from '../storage/uploader';

interface CreateAttachmentRequest {
  fileName: string;
  fileType: string;
  body: Buffer;
}

type CreateAttachmentResponse = Either<null, { attachment: Attachment }>;

@Injectable()
export class ServiceCreateAttachment {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: CreateAttachmentRequest): Promise<CreateAttachmentResponse> {
    const { url } = await this.uploader.upload({ fileName, fileType, body });

    const attachment = Attachment.create({ title: fileName, link: url });

    await this.attachmentRepository.create(attachment);

    return right({ attachment });
  }
}
