import {
  Controller,
  Get,
  Post,
  Body,
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
    private readonly usersService: UsersService,
  ) {}

  // --- GET so'rov (mavjud)
  @Get('nearby')
  async getNearby(
    @Query('user_id', new ParseFloatPipe()) user_id: number,
    @Query('lat', new ParseFloatPipe()) lat: number,
    @Query('lon', new ParseFloatPipe()) lon: number,
    @Query('radius', new DefaultValuePipe(5), new ParseFloatPipe()) radius_km: number,
  ) {
    return this.usersService.findNearby(user_id, lat, lon, radius_km);
  }

  // --- POST so'rov (qo'shildi)
  @Post('nearby')
  async getNearbyByPost(
    @Body('user_id') user_id: number,
    @Body('lat') lat: number,
    @Body('lon') lon: number,
    @Body('radius') radius_km: number = 5,
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
      const fileName = path.basename(user.photo);
      formatted.photo = `/uploads/${fileName}`;
    }

    return formatted;
  }
}
