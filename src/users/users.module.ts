import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserController } from './getUser.controller';
import { User } from './entities/user.entity';
import { PhotosModule } from '../photos.module'; // ✅

@Module({
  imports: [TypeOrmModule.forFeature([User]), PhotosModule], // ✅
  controllers: [UsersController, UserController],
})
export class UsersModule {}
