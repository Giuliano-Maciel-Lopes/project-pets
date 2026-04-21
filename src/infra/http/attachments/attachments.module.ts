import { Module } from '@nestjs/common';
import { DataBaseModule } from '@/infra/database/database.module';
import { StorageModule } from '@/infra/storage/storage.module';
import { ServiceCreateAttachment } from '@/domain/Attachment/application/services/create-attachment-service';
import { ControllerUploadAttachment } from './controller/upload-attachment.controller';

@Module({
  imports: [DataBaseModule, StorageModule],
  controllers: [ControllerUploadAttachment],
  providers: [ServiceCreateAttachment],
})
export class AttachmentsModule {}
