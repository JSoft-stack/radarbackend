import {
  Controller,
  Get,
  Query,
  ParseFloatPipe,
  DefaultValuePipe,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('get-user')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // private readonly photosService: PhotosService, // ✅ внедряем сервис
    private readonly usersService: UsersService, // ✅ внедряем сервис
  ) {}

  @Get('nearby')
  async getNearby(
    @Query('user_id', new ParseFloatPipe()) user_id: number,
    @Query('lat', new ParseFloatPipe()) lat: number,
    @Query('lon', new ParseFloatPipe()) lon: number,
    @Query('radius', new DefaultValuePipe(5), new ParseFloatPipe()) radius_km: number,
    // @Query('limit', new DefaultValuePipe(50), new ParseFloatPipe()) limit: number,
  ) {
    return this.usersService.findNearby(user_id, lat, lon, radius_km);
  }

  

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
