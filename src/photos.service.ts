import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  /**
   * Определяем реальный URL Telegram фото (если есть редирект)
   */
  async resolveTelegramPhotoUrl(photoUrl: string): Promise<string> {
    try {
      const res = await axios.head(photoUrl, {
        maxRedirects: 0,
        validateStatus: null,
      });
      const redirectUrl = res.headers['location'];
      return redirectUrl || photoUrl;
    } catch {
      return photoUrl;
    }
  }

  /**
   * Скачиваем и сохраняем файл по URL
   */
  async downloadAndSave(fileUrl: string): Promise<string> {
    if (!fileUrl || typeof fileUrl !== 'string') {
      throw new BadRequestException('url_photo must be a valid string');
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const urlObj = new URL(fileUrl);
    let fileName = path.basename(urlObj.pathname);

    const existingPhoto = await this.photoRepository.findOne({
      where: { url_photo: `/uploads/${fileName}` },
    });
    if (existingPhoto) {
      return existingPhoto.url_photo;
    }

    if (!fileName) fileName = 'photo.jpg';

    const finalPath = path.join(uploadDir, fileName);

    try {
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      fs.writeFileSync(finalPath, response.data);

      const relativePath = `/uploads/${fileName}`;
      await this.photoRepository.save({ url_photo: relativePath });

      return relativePath;
    } catch (err) {
      console.error('Ошибка скачивания файла:', err.message);
      throw new BadRequestException('Не удалось скачать файл по указанному URL');
    }
  }
}
