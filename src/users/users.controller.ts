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

  private async resolveTelegramPhotoUrl(photoUrl: string): Promise<string> {
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

  private async downloadAndSave(photoUrl: string, userId: number): Promise<string> {
    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `${userId}.jpg`;
      const filePath = path.join(uploadsDir, fileName);

      const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);

      // Возвращаем относительный путь
      return `uploads/${fileName}`;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error.message);
      throw new BadRequestException('Не удалось сохранить фото');
    }
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const userExists = await this.userRepository.findOne({
      where: { user_id: createUserDto.user_id },
    });

    if (createUserDto.photo_url) {
      try {
        const realUrl = await this.resolveTelegramPhotoUrl(createUserDto.photo_url);
        const localPath = await this.downloadAndSave(realUrl, Number(createUserDto.user_id));
        createUserDto.photo = localPath;
        console.log('Фото сохранено:', localPath);
      } catch (err) {
        console.error('Ошибка при загрузке фото:', err.message);
        throw new BadRequestException('Не удалось сохранить фото');
      }
    }

    if (userExists) {
      await this.userRepository.update(userExists.id, createUserDto);
      return this.userRepository.findOne({ where: { id: userExists.id } });
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (updateUserDto.photo_url) {
      const realUrl = await this.resolveTelegramPhotoUrl(updateUserDto.photo_url);
      const localPath = await this.downloadAndSave(realUrl, Number(id));
      updateUserDto.photo = localPath;
      console.log('Фото обновлено:', localPath);
    }

    await this.userRepository.update(+id, updateUserDto);
    return this.userRepository.findOne({ where: { id: +id } });
  }
}
