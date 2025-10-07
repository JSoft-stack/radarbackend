import {
  Controller,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { User } from './entities/user.entity';
import { PhotosService } from '../photos.service'; // ✅ подключаем сервис

@Controller('get-user')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly photosService: PhotosService, // ✅ внедряем сервис
  ) {}

   @Get()
  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userRepository.findOne({ where: { id: +id } });
    if (!user) throw new NotFoundException('User not found');
    return this.formatUserResponse(user);
  }

  private formatUserResponse(user: User) {
    if (!user) return null;

    const formatted = { ...user };

    if (user.photo) {
      const fileName = path.basename(user.photo); // только имя файла
      formatted.photo = `/uploads/${fileName}`; // путь для браузера
    }

    return formatted;
  }

}
