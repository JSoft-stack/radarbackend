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

@Controller('create-user')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Получаем реальный URL Telegram-аватарки
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

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // Проверяем — существует ли пользователь
    const userExists = await this.userRepository.findOne({
      where: { user_id: createUserDto.user_id },
    });

    // Если есть photo_url — получаем реальный URL
    if (createUserDto.photo_url) {
      try {
        const realUrl = await this.resolveTelegramPhotoUrl(createUserDto.photo_url);
        createUserDto.photo = realUrl; // сохраняем реальный URL в поле "photo"
        console.log('Реальный URL фото:', realUrl);
        
      } catch (err) {
        console.error('Ошибка при получении реального URL фото:', err.message);
        throw new BadRequestException('Не удалось получить реальный URL фото');
      }
    }

    // Если пользователь уже есть — обновляем
    if (userExists) {
      await this.userRepository.update(userExists.id, createUserDto);
      return this.userRepository.findOne({ where: { id: userExists.id } });
    }

    // Если новый — создаем
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (updateUserDto.photo_url) {
      const realUrl = await this.resolveTelegramPhotoUrl(updateUserDto.photo_url);
      updateUserDto.photo = realUrl;

      console.log('Реальный URL фото:', realUrl);
      
    }
    await this.userRepository.update(+id, updateUserDto);
    return this.userRepository.findOne({ where: { id: +id } });
  }
}
