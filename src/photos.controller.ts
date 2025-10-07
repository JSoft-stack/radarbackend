import { Controller, Post, Body } from '@nestjs/common';
import { PhotosService } from './photos.service';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('save-from-url')
  async saveFromUrl(@Body('url_photo') url: string) {
    const localPath = await this.photosService.downloadAndSave(url);
    return { message: 'Файл сохранён', localPath };
  }
}
