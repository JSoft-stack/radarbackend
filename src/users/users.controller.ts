import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Controller('create-user')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 📥 Скачиваем фото и сохраняем в uploads
  private async downloadAndSave(photoUrl: string, userId: number): Promise<string> {
    try {
      const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'users');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${userId}.jpg`;
      const filePath = path.join(uploadDir, fileName);
      const writer = fs.createWriteStream(filePath);

      const response = await axios({
        url: photoUrl,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(writer);

      // Возвращаем Promise, который выполняется после записи файла
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Возвращаем путь от вашей папки
      return `/uploads/users/${fileName}`;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error.message);
      throw new BadRequestException('Не удалось сохранить фото');
    }
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { user_id: createUserDto.user_id },
    });

    if (createUserDto.photo_url) {
      const localPath = await this.downloadAndSave(
        createUserDto.photo_url,
        createUserDto.user_id,
      );
      createUserDto.photo = localPath; // сохраняем локальный путь
    }

    if (existing) {
      await this.userRepository.update(existing.id, createUserDto);
      return this.userRepository.findOne({ where: { id: existing.id } });
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (updateUserDto.photo_url) {
      const localPath = await this.downloadAndSave(
        updateUserDto.photo_url,
        +id,
      );
      updateUserDto.photo = localPath;
    }

    await this.userRepository.update(+id, updateUserDto);
    return this.userRepository.findOne({ where: { id: +id } });
  }
}
