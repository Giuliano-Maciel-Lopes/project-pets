import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname, resolve } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { Uploader, UploadParams, UploadResult } from '@/domain/Attachment/application/storage/uploader';

@Injectable()
export class LocalStorage implements Uploader {
  private readonly uploadsDir = resolve(process.cwd(), 'uploads');

  async upload({ fileName, body }: UploadParams): Promise<UploadResult> {
    await mkdir(this.uploadsDir, { recursive: true });

    const ext = extname(fileName);
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = resolve(this.uploadsDir, uniqueName);

    await writeFile(filePath, body);

    return { url: `/uploads/${uniqueName}` };
  }
}
