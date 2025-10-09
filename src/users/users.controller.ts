import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';

@Controller('create-user')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async resolveTelegramPhotoUrl(photoUrl: string): Promise<string> {
    try {
      const res = await axios.head(photoUrl, {
        maxRedirects: 0,
        validateStatus: null,
      });
      return res.headers['location'] || photoUrl;
    } catch {
      return photoUrl;
    }
  }

  private async downloadAndSave(photoUrl: string, userId: number): Promise<string> {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `${userId}.jpg`;
      const filePath = path.join(uploadsDir, fileName);

      const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);

      // возвращаем относительный путь
      return `uploads/${fileName}`;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error.message);
      throw new BadRequestException('Не удалось сохранить фото');
    }
  }

  // --- Создание пользователя ---
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const userExists = await this.userRepository.findOne({
      where: { user_id: createUserDto.user_id },
    });

    if (createUserDto.photo_url) {
      try {
        const realUrl = await this.resolveTelegramPhotoUrl(createUserDto.photo_url);
        const localPath = await this.downloadAndSave(realUrl, Number(createUserDto.user_id));

        const protocol = req.protocol;
        const host = req.get('host');
        const BASE_URL = `${protocol}://${host}`;
        createUserDto.photo = `${BASE_URL}/${localPath.replace(/\\/g, '/')}`;

        console.log('Фото сохранено:', createUserDto.photo);
      } catch (err) {
        console.error('Ошибка при загрузке фото:', err.message);
        throw new BadRequestException('Не удалось сохранить фото');
      }
    }

    createUserDto['last_active_time'] = new Date().toISOString();

    if (userExists) {
      await this.userRepository.update(userExists.id, createUserDto);
      return this.userRepository.findOne({ where: { id: userExists.id } });
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  // --- Обновление пользователя ---
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    if (updateUserDto.photo_url) {
      const realUrl = await this.resolveTelegramPhotoUrl(updateUserDto.photo_url);
      const localPath = await this.downloadAndSave(realUrl, Number(id));

      const protocol = req.protocol;
      const host = req.get('host');
      const BASE_URL = `${protocol}://${host}`;
      updateUserDto.photo = `${BASE_URL}/${localPath.replace(/\\/g, '/')}`;

      console.log('Фото обновлено:', updateUserDto.photo);
    }

    updateUserDto['last_active_time'] = new Date().toISOString();

    await this.userRepository.update(+id, updateUserDto);
    return this.userRepository.findOne({ where: { id: +id } });
  }
}
