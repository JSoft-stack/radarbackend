import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserController } from './getUser.controller';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ✅
  controllers: [UsersController, UserController],
  providers:[UsersService]
})
export class UsersModule {}
