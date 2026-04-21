import { Module } from '@nestjs/common';
import { Uploader } from '@/domain/Attachment/application/storage/uploader';
import { LocalStorage } from './local-storage';

@Module({
  providers: [{ provide: Uploader, useClass: LocalStorage }],
  exports: [Uploader],
})
export class StorageModule {}
